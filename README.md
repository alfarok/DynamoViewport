# DynamoViewport
DynamoViewport is a [Dynamo](https://github.com/DynamoDS/Dynamo) view extension that instantiates a [CEF](https://bitbucket.org/chromiumembedded/cef) browser window. The browser runs a [three.js](https://github.com/mrdoob/three.js/) scene that displays Dynamo geometry via the render package data.  This project began as an experiment originally researched during a 2017 recharge sprint.  It is a WIP repo in early exploratory development.  Feel free to fork and make pull requests!

[Viewport Demo Video](https://youtu.be/qXHMFWbzC-0)

![IMG](https://github.com/alfarok/DynamoViewport/blob/CEF_Embedded/images/DynamoViewportExample.JPG?raw=true)

![IMG](https://github.com/alfarok/DynamoViewport/blob/master/images/SurfaceExample.JPG?raw=true)

![IMG](https://github.com/alfarok/DynamoViewport/blob/master/images/ReplicationExample.JPG?raw=true)

![IMG](https://github.com/alfarok/DynamoViewport/blob/CEF_Embedded/images/DynamoViewportEmbedded.gif?raw=true)

### CEF Sharp
CEF is either initialized by 
- DynamoCore in DynamoSandbox
- Revit in Dynamo for Revit 2020+
- Possibly another host application or plugin that is using CEF in the same process

Dynamo Viewport is exclusively built against DynamoCore v2.0 as GPU rendering was disabled during CEF initiatization in Dynamo 1.3.X and older

### Build/Install/Run Viewport
- Clone repo
- Build against x64 architecture (will fail if not specified)
- This should populate the `C:\..\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\DynamoPackage\Viewport` package folder. 
    - This `Viewport` folder should be copied to the appropriate Dynamo packages folder on your system or
    - The package can be automatically coped by uncommenting and modifying [this post-build step](https://github.com/alfarok/DynamoViewport/blob/master/src/ViewportViewExtension/ViewportViewExtension/ViewportViewExtension.csproj#L219), note the difference between copying to the Dynamo Core packages location versus Dynamo Revit
- If built and copied successfully the `Launch Viewport` menu option should appear under the `View` tab on the main Dynamo toolbar

### Debugging
`http://localhost:8088/`