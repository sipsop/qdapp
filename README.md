# Installation

* Get the latest version of node
* Install react-native-cli and rnpm

```bash
    $ npm install -g react-native-cli
    $ npm install -g rnpm
```

* Install dependendencies from the project folder:

```bash
    $ npm install
```

* For IOS: first install XCode. Then install Cocaopods and install dependencies:

```bash
    $ brew install cocaopods
    $ ( cd ios; pod install )
```

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

# Positioning

## flexDirection

Element size depends on the ``flex`` property (e.g. if all elements have ``flex: 1``,
then they all have equal size).

* ``row``
* ``column``

This specifies whether the primary axis is 'rows' or 'columns'.

## justifyContent

Specify how to layout things along the primary axis.

* ``flex-start``: left aligned (no spacing)
* ``flex-end``: right aligned (no spacing)
* ``center``: center the items (no spacing)
* ``space-between``: spread the items across the height/width, align them on the left
* ``space-around``: spread the items across the height/width, align them in the center

## alignItems

Specify how to layout the elements along the secondary axis.

* ``flex-start``
* ``center``
* ``flex-end``
* ``stretch``

# Libraries Used

For a list of components, see:

    https://github.com/jondot/awesome-react-native

See also:

    https://js.coach/react-native/react-native-carousel?search=carousel

and

    http://www.reactnative.com/best-react-native-components-so-far-while-we-wait-for-android/

### Intro Screen

https://www.npmjs.com/package/react-native-viewpager
https://github.com/FuYaoDe/react-native-app-intro

### Navigation

https://github.com/aksonov/react-native-router-flux (1800+ stars)

https://github.com/23c/react-native-transparent-bar

There is also a router component thing

### Tabs

https://github.com/skv-headless/react-native-scrollable-tab-view (1700+ stars)

### Buttons

https://github.com/larsvinter/react-native-awesome-button
https://github.com/APSL/react-native-button

### Progress

https://github.com/imartingraham/react-native-progress

### Auto Complete

### Swiping

https://github.com/leecade/react-native-swiper
https://www.npmjs.com/package/react-native-viewpager

### Carousel

https://github.com/nick/react-native-carousel

### Card Swiping (like/dislike)

https://github.com/meteor-factory/react-native-tinder-swipe-cards

### Spinners

react-native-spinkit

### Chat

Entire chat implementation:

    https://github.com/FaridSafi/react-native-gifted-chat
