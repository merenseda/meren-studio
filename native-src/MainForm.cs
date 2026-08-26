using System;
using System.IO;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace MerenNative
{
    public class MainForm : Form
    {
        private WebView2 webView;
        private string? currentFilePath = null;
        private readonly string? initialFileToOpen;

        public MainForm(string? filePath = null)
        {
            this.initialFileToOpen = filePath;
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "Meren Studio (Native x86-64) - .hrav Formatı";
            this.Width = 1240;
            this.Height = 840;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = System.Drawing.Color.FromArgb(12, 16, 23);

            webView = new WebView2
            {
                Dock = DockStyle.Fill
            };
            this.Controls.Add(webView);

            this.Load += MainForm_Load;
        }

        private async void MainForm_Load(object? sender, EventArgs e)
        {
            try
            {
                var env = await CoreWebView2Environment.CreateAsync(null, Path.Combine(Path.GetTempPath(), "MerenStudio_UserData"));
                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.Settings.IsWebMessageEnabled = true;
                webView.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;

                string htmlContent = GetEmbeddedUiHtml();
                webView.CoreWebView2.NavigateToString(htmlContent);
            }
            catch (Exception ex)
            {
                MessageBox.Show("WebView2 başlatılamadı: " + ex.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private string GetEmbeddedUiHtml()
        {
            var assembly = Assembly.GetExecutingAssembly();
            using var stream = assembly.GetManifestResourceStream("MerenNative.Resources.app_ui.html");
            if (stream != null)
            {
                using var reader = new StreamReader(stream);
                return reader.ReadToEnd();
            }

            string localPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "app_ui.html");
            if (File.Exists(localPath))
            {
                return File.ReadAllText(localPath);
            }

            return "<h1>Hata: app_ui.html kaynağı bulunamadı.</h1>";
        }

        private void CoreWebView2_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                string json = e.WebMessageAsJson;
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                string action = root.GetProperty("action").GetString() ?? "";
                var payload = root.GetProperty("payload");

                switch (action)
                {
                    case "ready":
                        if (!string.IsNullOrEmpty(initialFileToOpen) && File.Exists(initialFileToOpen))
                        {
                            LoadFileIntoEditor(initialFileToOpen);
                        }
                        break;

                    case "newFile":
                        currentFilePath = null;
                        break;

                    case "openFile":
                        HandleOpenFileDialog();
                        break;

                    case "saveFile":
                        HandleSaveFile(payload, false);
                        break;

                    case "saveAsFile":
                        HandleSaveFile(payload, true);
                        break;

                    case "exportHtml":
                        HandleExportHtml(payload);
                        break;
                }
            }
            catch (Exception ex)
            {
                SendJsonToWeb(new { type = "error", message = ex.Message });
            }
        }

        private void HandleOpenFileDialog()
        {
            using var ofd = new OpenFileDialog
            {
                Title = ".hrav Dosyası Aç (Otomatik Şifre Çözülür)",
                Filter = "Hrav Şifreli Dokümanı (*.hrav)|*.hrav|Tüm Dosyalar (*.*)|*.*"
            };

            if (ofd.ShowDialog(this) == DialogResult.OK)
            {
                LoadFileIntoEditor(ofd.FileName);
            }
        }

        private void LoadFileIntoEditor(string filePath)
        {
            try
            {
                byte[] raw = File.ReadAllBytes(filePath);
                var document = MerenEngine.DecryptAndUnpack(raw);
                currentFilePath = filePath;

                SendJsonToWeb(new
                {
                    type = "loadedDoc",
                    filePath = currentFilePath,
                    fileSize = raw.Length,
                    document = document
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Dosya Okuma Hatası", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void HandleSaveFile(JsonElement payload, bool forceSaveAs)
        {
            try
            {
                var doc = JsonSerializer.Deserialize<HravDocument>(payload.GetRawText());
                if (doc == null) return;

                if (forceSaveAs || string.IsNullOrEmpty(currentFilePath))
                {
                    using var sfd = new SaveFileDialog
                    {
                        Title = ".hrav Olarak Kaydet (Otomatik AES-256 Şifrelenir)",
                        Filter = "Hrav Şifreli Dokümanı (*.hrav)|*.hrav",
                        FileName = (doc.title ?? "Belge") + ".hrav"
                    };

                    if (sfd.ShowDialog(this) != DialogResult.OK)
                    {
                        return;
                    }
                    currentFilePath = sfd.FileName;
                }

                byte[] encryptedBytes = MerenEngine.PackAndEncrypt(doc);
                File.WriteAllBytes(currentFilePath, encryptedBytes);

                SendJsonToWeb(new
                {
                    type = "saveSuccess",
                    filePath = currentFilePath,
                    fileSize = encryptedBytes.Length
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Kaydetme hatası: " + ex.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void HandleExportHtml(JsonElement payload)
        {
            try
            {
                var doc = JsonSerializer.Deserialize<HravDocument>(payload.GetRawText());
                if (doc == null) return;

                using var sfd = new SaveFileDialog
                {
                    Title = "Standart HTML Olarak Dışa Aktar",
                    Filter = "HTML Dosyası (*.html)|*.html",
                    FileName = (doc.title ?? "Belge") + ".html"
                };

                if (sfd.ShowDialog(this) == DialogResult.OK)
                {
                    string html = MerenEngine.ExportToHtml(doc);
                    File.WriteAllText(sfd.FileName, html, System.Text.Encoding.UTF8);
                    MessageBox.Show("HTML başarıyla dışa aktarıldı:\n" + sfd.FileName, "Başarılı", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Dışa aktarma hatası: " + ex.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void SendJsonToWeb(object messageObj)
        {
            string json = JsonSerializer.Serialize(messageObj);
            webView.BeginInvoke(new Action(() =>
            {
                webView.CoreWebView2?.PostWebMessageAsJson(json);
            }));
        }
    }
}
