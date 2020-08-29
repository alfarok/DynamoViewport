﻿using System;
using System.Linq;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using CefSharp;

namespace ViewportViewExtension
{
    internal class CefSharpSchemeHandler : ResourceHandler
    {
        public override bool ProcessRequestAsync(IRequest request, ICallback callback)
        {
            var uri = new Uri(request.Url);
            var fileName = uri.AbsolutePath;

            Task.Run(() =>
            {
                using (callback)
                {
                    Stream stream = null;

                    if (string.Equals(fileName, "/PostDataTest.html", StringComparison.OrdinalIgnoreCase))
                    {
                        var postDataElement = request.PostData.Elements.FirstOrDefault();
                        stream = ResourceHandler.GetMemoryStream("Post Data: " + (postDataElement == null ? "null" : postDataElement.GetBody()), Encoding.UTF8);
                    }

                    if (string.Equals(fileName, "/PostDataAjaxTest.html", StringComparison.OrdinalIgnoreCase))
                    {
                        var postData = request.PostData;
                        if (postData == null)
                        {
                            stream = ResourceHandler.GetMemoryStream("Post Data: null", Encoding.UTF8);
                        }
                        else
                        {
                            var postDataElement = postData.Elements.FirstOrDefault();
                            stream = ResourceHandler.GetMemoryStream("Post Data: " + (postDataElement == null ? "null" : postDataElement.GetBody()), Encoding.UTF8);
                        }
                    }

                    if (stream == null)
                    {
                        callback.Cancel();
                    }
                    else
                    {
                        // Reset the stream position to 0 so the stream can be copied into the underlying unmanaged buffer
                        stream.Position = 0;
                        // Populate the response values
                        ResponseLength = stream.Length;
                        MimeType = "text/html";
                        StatusCode = (int)HttpStatusCode.OK;
                        Stream = stream;

                        callback.Continue();
                    }
                }
            });

            return true;
        }
    }
}