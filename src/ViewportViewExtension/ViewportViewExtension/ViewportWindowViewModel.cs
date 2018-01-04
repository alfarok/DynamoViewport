using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Linq;
using Autodesk.DesignScript.Interfaces;
using Dynamo.Core;
using Dynamo.Extensions;
using Dynamo.Graph.Nodes;
using Dynamo.Graph.Workspaces;
using Dynamo.Models;
using Dynamo.Visualization;
using CefSharp;
using Newtonsoft.Json.Linq;

namespace ViewportViewExtension
{
   public class ViewportWindowViewModel : NotificationObject, IDisposable
    {
        private string selectedNodesText = "Begin selecting ";

        // Variable for storing a reference to our loaded parameters
        private ReadyParams readyParams;
        
        // TODO get/set
        public RenderPackageCache packageContent;
        public string transactionType = "";
        public string nodeGuid = "";
        public bool displayPreview = true;

        // Find render nodes and build THREE meshes
        public string RenderData => $"{getRenderPackages()}";

        public string getRenderPackages()
        {
            // javascript function
            string output = "renderDynamoMesh(";

            // TODO don't convert enums to lists
            List<double> verts = new List<double>();
            List<int> indices = new List<int>();

            List<double> points = new List<double>();
            List<int> pointIndices = new List<int>();

            List<double> lines = new List<double>();
            List<int> lineIndices = new List<int>();

            foreach (IRenderPackage p in packageContent.Packages)
            {
                verts = p.MeshVertices.ToList();
                indices = p.MeshIndices.ToList();

                points = p.PointVertices.ToList();
                pointIndices = p.PointIndices.ToList();

                lines = p.LineStripVertices.ToList();
                lineIndices = p.LineStripIndices.ToList();

            }

            JObject meshObject = new JObject(
                new JProperty("name", nodeGuid),
                new JProperty("transactionType", transactionType),
                new JProperty("displayPreview", displayPreview),

                new JProperty("vertices", verts),
                new JProperty("faceIndices", indices),
                new JProperty("points", points),
                new JProperty("lines", lines)
                );

            string jsonString = meshObject.ToString();

            output += jsonString + ");";

            return output;
        }

        public ViewportWindowViewModel(ReadyParams p)
        {
            // Save a reference to our loaded parameters which
            // is required in order to access the workspaces
            readyParams = p;

            // Subscribe to NodeAdded and NodeRemoved events
            p.CurrentWorkspaceModel.NodeAdded += CurrentWorkspaceModel_NodeAdded;
            p.CurrentWorkspaceModel.NodeRemoved += CurrentWorkspaceModel_NodeRemoved;

            // TODO this could be dangerous if called in custom node ws
            HomeWorkspaceModel currentWS = readyParams.CurrentWorkspaceModel as HomeWorkspaceModel;
            //currentWS.RefreshCompleted += CurrentWorkspaceModel_NodesChanged;
        }

        // When a new node is added to the workspace
        private void CurrentWorkspaceModel_NodeAdded(NodeModel node)
        {
            // Update viewport when nodes render package is updated
            node.RenderPackagesUpdated += CurrentWorkspaceModel_UpdateViewportGeometry;
            
            // Listen for property changes on added node ex: toggle background preview
            node.PropertyChanged += CurrentWorkspaceModel_nodePropertyChanged;
        }

        // When an existing node is removed from the workspace
        private void CurrentWorkspaceModel_NodeRemoved(NodeModel node)
        {
            nodeGuid = node.GUID.ToString();
            transactionType = "remove";
            // Unregister when node is removed
            RaisePropertyChanged("RenderData");
            node.RenderPackagesUpdated -= CurrentWorkspaceModel_UpdateViewportGeometry;
        }

        private void CurrentWorkspaceModel_UpdateViewportGeometry(NodeModel nodeModel, RenderPackageCache packages)
        {
            packageContent = packages;
            displayPreview = nodeModel.ShouldDisplayPreview;
            nodeGuid = nodeModel.GUID.ToString();
            transactionType = "update";
            RaisePropertyChanged("RenderData");
        }

        private void CurrentWorkspaceModel_nodePropertyChanged(object sender, EventArgs e)
        {
            NodeModel node = sender as NodeModel;
            PropertyChangedEventArgs eventArgs= e as PropertyChangedEventArgs;
            string changedProperty = eventArgs.PropertyName;

            if(changedProperty == "IsVisible")
            {
                transactionType = "togglePreview";
                nodeGuid = node.GUID.ToString();
                displayPreview = node.IsVisible;
                RaisePropertyChanged("RenderData");
            }
        }

        // Very important - unsubscribe from our events
        public void Dispose()
        {          
            readyParams.CurrentWorkspaceModel.NodeAdded -= CurrentWorkspaceModel_NodeAdded;
            readyParams.CurrentWorkspaceModel.NodeRemoved -= CurrentWorkspaceModel_NodeRemoved;
        }
    }
}
