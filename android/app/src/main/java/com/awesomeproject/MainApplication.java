package com.awesomeproject;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.cardio.RNCardIOPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.BV.LinearGradient.LinearGradientPackage;

// import com.auth0.lock.react;
import com.auth0.lock.react.LockReactPackage;
import com.auth0.core.Strategies;
import com.auth0.identity.IdentityProvider;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    protected boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      LockReactPackage lockReactPackage = new LockReactPackage();
    //   lockReactPackage.addIdentityProvider(Strategies.GooglePlus, new GooglePlusIdentityProvider(this));
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNCardIOPackage(),
          lockReactPackage,
          new MapsPackage(),
          new LinearGradientPackage()
          );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }
}
