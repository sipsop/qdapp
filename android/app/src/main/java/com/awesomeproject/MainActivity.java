package com.awesomeproject;

import com.facebook.react.ReactActivity;
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
    //     return Arrays.asList(
    //         new MainReactPackage(), new ReactNativeWheelPickerPackage());
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

