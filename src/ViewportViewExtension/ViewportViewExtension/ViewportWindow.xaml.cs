using System;
using System.Windows;
using CefSharp;
using CefSharp.Wpf;
using System.Windows.Controls;
using System.Windows.Data;
using System.IO;

namespace ViewportViewExtension
{
    public partial class ViewportWindow : Window
    {
        public ViewportWindow()
        {
            if (!Cef.IsInitialized)
            {
                var settings = new CefSettings { RemoteDebuggingPort = 8088 };

                settings.RegisterScheme(new CefCustomScheme
                {
                    SchemeName = CefSharpSchemeHandlerFactory.SchemeName,
                    SchemeHandlerFactory = new CefSharpSchemeHandlerFactory()
                });

                Cef.Initialize(settings);
            }

            InitializeComponent();

            // Center initial viewport window upon launch
            WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
        }

        private async void ExecuteJavaScriptBtn_Click(object sender, RoutedEventArgs e)
        {
            if (/*Browser.CanExecuteJavascriptInMainFrame &&*/ !string.IsNullOrWhiteSpace(ScriptTextBox.Text))
            {
                JavascriptResponse response = await Browser.EvaluateScriptAsync(ScriptTextBox.Text);
            }

            // TODO - view history and active geometry
            ScriptTextBox.Clear();
        }
    }
}