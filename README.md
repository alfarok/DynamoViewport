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

Dynamo Viewport is exclusively built against DynamoCore v2.0 as GPU rendering was disabled during CEF initiatization in Dynamo 1.3.X and older.  The master branch is currently built against DynamoCore v2.7+, for legacy core support see additional branches.  The latest Dynamo NuGet dependency specs can be found [here](https://github.com/alfarok/DynamoViewport/blob/master/src/ViewportViewExtension/ViewportViewExtension/packages.config#L8).

### Build/Install/Run Viewport
- Clone repo
- Build the solution using Visual Studio or MSBuild
- This should populate the `C:\..\DynamoViewport\src\ViewportViewExtension\ViewportViewExtension\DynamoPackage\Viewport` package folder. 
    - This `Viewport` folder should be copied to the appropriate Dynamo packages folder on your system manually, or
    - The package can be automatically coped by modifying [this post-build step](https://github.com/alfarok/DynamoViewport/blob/master/src/ViewportViewExtension/ViewportViewExtension/ViewportViewExtension.csproj#L218), update the Dynamo Core version in the path accordingly
- If built and copied successfully the `Launch Viewport` menu option should appear under the `View` tab on the main Dynamo toolbar

### Debugging
`http://localhost:8088/`
