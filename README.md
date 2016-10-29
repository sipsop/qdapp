# Installation

* Get the latest version of node
* Install react-native-cli:

```bash
    $ npm install -g react-native-cli
```

* Install dependendencies from the project folder:

```bash
    $ npm install
```

* For IOS: first install XCode. Then install Cocaopods and install dependencies:

```bash
    $ react-native link
    $ react-native run-ios
```

If there is a complaints about missing FontAwesome, see

    http://stackoverflow.com/questions/35317197/how-to-link-react-native-vector-icons-to-project

and

    http://codewithchris.com/common-mistakes-with-adding-custom-fonts-to-your-ios-app/

(especially Step 4).

If this fails to build with a compile error of react-native-maps, try the following:

```
Change

AIRMap.h line 12
From #import
To #import "RCTComponent.h"

and

AIRMapCallout.h line 7
From #import "React/RCTView.h"
To #import "RCTView.h"
```

see https://github.com/lelandrichardson/react-native-maps/issues/371

For the ``@interface` error see:

    https://github.com/airbnb/react-native-maps/issues/371

Now build the app and run it in a simulator:

```bash
react-native run-ios
```

* For Android: install android-studio and update PATH:

```bash
# on OS X
export ANDROID_HOME=$HOME/Library/Android/sdk/
export PATH="\
$HOME/Library/Android/sdk/tools:\
$HOME/Library/Android/sdk/platform-tools:\
$PATH"
```

Now build for android and run in an emulator or on a connected device:

```bash
    $ react-native run-android
```

The build may fail due to a missing SDK version. If so, run

```bash
    $ android
```

and select any missing packages. Devices can be managed through the ADB simulator icon in android studio, or directly through the `adb` command.

Once the build is successful, make sure to start the the build/package server to serve the code:

```bash
    $ react-native start
```
