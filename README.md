# Features

Features we may want for users and for bar staff.

## Features for Users

### Basics

* beta
* social login (configure Auth0)
* automatic updates (codepush)
* set spending limit for the night
* deal async storage exceptions (e.g. when full)
* implement state versioning
* deal with cache versioning
* deal with state upgrades
* simulate download and cache errors

### Search

Search across maps on the discover page. Search across menu on the bar, menu
and order page.

Long term: search for a bar with outdoor seating and guinness on tap.

### Table Booking + Pre-Orders

* book a table at a bar
    * put down deposit (e.g. 5 pounds per person, in case you don't show)
    * pre-order food / drinks
* get notified by email and in-app about booking status

### Loyalty

* get rewarded for loyalty
    * "5th drink free"

### Events

See what events are being advertised by bars.

Probably include an events page: you're not looking for a specific bar, you're
looking for something to do. Do you want to see a live rock band, a dj, pub trivia or
Manchester United vs Arsenal?

### Social Features

* snap & share picture of drinks / friends
* checkins. Share with friends in-app if agreed to
    * "Two of your friends are currently at The Eagle"
* invites
    * invite friends to go to pub
    * set time and place
* share location with friends
    * see how far your friends are from the pub, etc
* create & share pub crawl
    * share on fb etc
    * share with friends on app
    * if wanted, announce publicly (on events page)

### Payments

* split the bill between friends
* ping your friends a beer
* top up at a pub
    * top up 20 pounds at The Eagle
    * get a discount

### Recommendation Engine

* show recommendations in menu
* show recommendations in receipt

### Generate and Access Useful Info

* write reviews for drinks / bars
* rate drinks / bars

### Personal Goals

* set goals, e.g. "try all dark ales"
* collect badges for different items purchased

## Features for Bar Staff

### Bar Status Administation

* enable/disable order taking
* enable/disable table service
* close down individual bars
    * e.g. close the bar on the first floor

### Menu Administration

* support adding new options / changing existing options for drinks and food
    * give each option a name
    * add price to each applicable option
    * set selection type
        * zero or one
        * zero or more
        * one or more
    * e.g. change "beerOptions" to only include sherry, lime, and blackcurrant as options
* enable/disable menu items
* change menu items
    * set price for each applicable option
    * assign item options
* add new menu items (e.g. food)
    * add a name and picture
    * add item options + prices
        * item: burger
        * options1: (select one): rare, medium rare, well-done
        * options2: (select zero or more): cheese, bacon, lettuce, mayonnaise, ...

### Order Streaming

* let bar staff claim individual orders
    * allows staff performance tracking
    * gives a personal touch
    * accountability

### Search

Search works similar to the way it works for users, but on the order page
it streams in the latest orders. In this case, search across (loaded) order history.

### Social Features

* Feed for bar tenders to discover what everyone is up to (and show off their skills)
    * show off what cocktails they make
    * see what kind of events are happening
    * see what new bars are opening
    * etc

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
