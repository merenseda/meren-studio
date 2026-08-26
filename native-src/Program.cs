using System;
using System.IO;
using System.Windows.Forms;

namespace MerenNative
{
    internal static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            ApplicationConfiguration.Initialize();

            string? initialFile = null;
            if (args.Length > 0 && File.Exists(args[0]))
            {
                initialFile = Path.GetFullPath(args[0]);
            }

            Application.Run(new MainForm(initialFile));
        }
    }
}