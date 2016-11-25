#!/bin/bash

unzip "$1" -d ./logo
./installLogo
react-native run-android
