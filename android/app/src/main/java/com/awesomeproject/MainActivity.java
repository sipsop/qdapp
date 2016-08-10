package com.awesomeproject;

import com.facebook.react.ReactActivity;
// import com.zyu.ReactNativeWheelPickerPackage;
// import com.oblador.vectoricons.VectorIconsPackage;
// import com.webschik.SpinnerPackage;
import com.airbnb.android.react.maps.MapsPackage;
// import com.webschik.reactnativedropdown.SpinnerPackage;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "AwesomeProject";
    }

    // protected List<ReactPackage> getPackages() {
    //      return Arrays.asList(
    //         new MainReactPackage(),
    //         // new ReactNativeWheelPickerPackage(),
    //         // new VectorIconsPackage(),
    //         // new SpinnerPackage(),
    //         // new MapsPackage()
    //         // new ReactNativeWheelPickerPackage()
    //         );
    // }

    // @Override
    // protected void onCreate(Bundle savedInstanceState) {
    //   super.onCreate(savedInstanceState);
    //   mReactRootView = new ReactRootView(this);

    //   mReactInstanceManager = ReactInstanceManager.builder()
    //     .setApplication(getApplication())
    //     .setBundleAssetName("index.android.bundle")
    //     .setJSMainModuleName("index.android")
    //     .addPackage(new MainReactPackage())
    //     .addPackage(new SpinnerPackage())              // add here
    //     .setUseDeveloperSupport(BuildConfig.DEBUG)
    //     .setInitialLifecycleState(LifecycleState.RESUMED)
    //     .build();

    //   mReactRootView.startReactApplication(mReactInstanceManager, "ExampleRN", null);

    //   setContentView(mReactRootView);
    // }
}

