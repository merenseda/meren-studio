using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace MerenNative
{
    public class HravDocument
    {
        public string version { get; set; } = "1.0";
        public string title { get; set; } = "Yeni Hrav Dokümanı";
        public string createdAt { get; set; } = DateTime.UtcNow.ToString("o");
        public string updatedAt { get; set; } = DateTime.UtcNow.ToString("o");
        public string html { get; set; } = "";
        public string css { get; set; } = "";
        public string js { get; set; } = "";
        public object? metadata { get; set; } = new { };
    }

    public static class MerenEngine
    {
        private static readonly byte[] MAGIC_BYTES = Encoding.UTF8.GetBytes("HRAV_V1\0"); // 8 bayt
        private const int SALT_LENGTH = 16;
        private const int IV_LENGTH = 12;
        private const int TAG_LENGTH = 16;
        private static readonly int HEADER_LENGTH = MAGIC_BYTES.Length + SALT_LENGTH + IV_LENGTH + TAG_LENGTH; // 52 bayt

        private const string APP_SECRET = "MerenStudio#SecureEncryptedFormat@2026!7x9K$qL";

        private static byte[] DeriveKey(byte[] salt)
        {
            return Rfc2898DeriveBytes.Pbkdf2(APP_SECRET, salt, 100000, HashAlgorithmName.SHA256, 32);
        }

        public static byte[] PackAndEncrypt(HravDocument doc)
        {
            doc.updatedAt = DateTime.UtcNow.ToString("o");
            string json = JsonSerializer.Serialize(doc, new JsonSerializerOptions { WriteIndented = false });
            byte[] plaintext = Encoding.UTF8.GetBytes(json);

            byte[] salt = RandomNumberGenerator.GetBytes(SALT_LENGTH);
            byte[] iv = RandomNumberGenerator.GetBytes(IV_LENGTH);
            byte[] key = DeriveKey(salt);

            byte[] ciphertext = new byte[plaintext.Length];
            byte[] tag = new byte[TAG_LENGTH];

            using (var aesGcm = new AesGcm(key, TAG_LENGTH))
            {
                aesGcm.Encrypt(iv, plaintext, ciphertext, tag);
            }

            using var ms = new MemoryStream();
            ms.Write(MAGIC_BYTES, 0, MAGIC_BYTES.Length);
            ms.Write(salt, 0, salt.Length);
            ms.Write(iv, 0, iv.Length);
            ms.Write(tag, 0, tag.Length);
            ms.Write(ciphertext, 0, ciphertext.Length);

            return ms.ToArray();
        }

        public static HravDocument DecryptAndUnpack(byte[] fileBytes)
        {
            if (fileBytes == null || fileBytes.Length < HEADER_LENGTH)
            {
                throw new InvalidDataException("Dosya boyutu geçersiz veya çok küçük!");
            }

            // 1. Magic Bytes kontrolü
            for (int i = 0; i < MAGIC_BYTES.Length; i++)
            {
                if (fileBytes[i] != MAGIC_BYTES[i])
                {
                    throw new InvalidDataException("Geçersiz dosya formatı! Bu dosya bir .hrav dosyası değil.");
                }
            }

            int offset = MAGIC_BYTES.Length;

            byte[] salt = new byte[SALT_LENGTH];
            Array.Copy(fileBytes, offset, salt, 0, SALT_LENGTH);
            offset += SALT_LENGTH;

            byte[] iv = new byte[IV_LENGTH];
            Array.Copy(fileBytes, offset, iv, 0, IV_LENGTH);
            offset += IV_LENGTH;

            byte[] tag = new byte[TAG_LENGTH];
            Array.Copy(fileBytes, offset, tag, 0, TAG_LENGTH);
            offset += TAG_LENGTH;

            int ciphertextLength = fileBytes.Length - offset;
            byte[] ciphertext = new byte[ciphertextLength];
            Array.Copy(fileBytes, offset, ciphertext, 0, ciphertextLength);

            byte[] key = DeriveKey(salt);
            byte[] plaintext = new byte[ciphertextLength];

            try
            {
                using (var aesGcm = new AesGcm(key, TAG_LENGTH))
                {
                    aesGcm.Decrypt(iv, ciphertext, tag, plaintext);
                }

                string json = Encoding.UTF8.GetString(plaintext);
                var doc = JsonSerializer.Deserialize<HravDocument>(json);
                return doc ?? throw new InvalidDataException("JSON verisi ayrıştırılamadı.");
            }
            catch (Exception)
            {
                throw new CryptographicException("Dosya şifresi çözülemedi! Dosya bozulmuş veya yetkisiz olarak değiştirilmiş.");
            }
        }

        public static string ExportToHtml(HravDocument doc)
        {
            string title = doc.title ?? "Hrav Dokümanı";
            string html = doc.html ?? "";
            string css = doc.css ?? "";
            string js = doc.js ?? "";

            return $@"<!DOCTYPE html>
<html lang=""tr"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>{System.Net.WebUtility.HtmlEncode(title)}</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #24292f;
      background-color: #ffffff;
      line-height: 1.6;
    }}
    {css}
  </style>
</head>
<body>
  {html}
  <script>
    {js}
  </script>
</body>
</html>";
        }
    }
}
