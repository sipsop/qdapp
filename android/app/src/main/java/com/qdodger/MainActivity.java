package com.qdodger;
import android.os.Bundle;
import com.crashlytics.android.Crashlytics;
// import com.crashlytics.android.ndk.CrashlyticsNdk;
import io.fabric.sdk.android.Fabric;
import com.facebook.react.ReactActivity;
import com.smixx.fabric.FabricPackage;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "QDodger";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // super.onCreate(savedInstanceState, new CrashlyticsNdk());
        super.onCreate(savedInstanceState);
        Fabric.with(this, new Crashlytics(), new Crashlytics());
        // throw new RuntimeException("Test Crash");
    }
}
