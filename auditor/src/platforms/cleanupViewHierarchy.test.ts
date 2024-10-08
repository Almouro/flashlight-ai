import { cleanupViewHierarchy } from "./cleanupViewHierarchy";

const sample = `<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<hierarchy rotation="0">
  <node index="0" text="" resource-id="" class="android.widget.FrameLayout"
    package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
    clickable="false" enabled="true" focusable="false" focused="false" scrollable="false"
    long-clickable="false" password="false" selected="false" bounds="[0,0][1080,2400]">
    <node index="0" text="" resource-id="" class="android.widget.LinearLayout"
      package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
      clickable="false" enabled="true" focusable="false" focused="false" scrollable="false"
      long-clickable="false" password="false" selected="false" bounds="[0,0][1080,2337]">
      <node index="0" text="" resource-id="android:id/content" class="android.widget.FrameLayout"
        package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
        clickable="false" enabled="true" focusable="false" focused="false" scrollable="false"
        long-clickable="false" password="false" selected="false" bounds="[0,132][1080,2337]">
        <node index="0" text="" resource-id="" class="androidx.compose.ui.platform.ComposeView"
          package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
          clickable="false" enabled="true" focusable="false" focused="false" scrollable="false"
          long-clickable="false" password="false" selected="false" bounds="[0,132][1080,2337]">
          <node index="0" text="" resource-id="" class="android.view.View"
            package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
            clickable="false" enabled="true" focusable="false" focused="false" scrollable="false"
            long-clickable="false" password="false" selected="false" bounds="[0,132][1080,2337]">
            <node index="0" text="" resource-id="" class="android.widget.EditText"
              package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
              clickable="true" enabled="true" focusable="true" focused="false" scrollable="false"
              long-clickable="true" password="false" selected="false" bounds="[335,1088][746,1214]">
              <node index="0" text="Enter your name" resource-id="" class="android.widget.TextView"
                package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
                clickable="false" enabled="true" focusable="false" focused="false"
                scrollable="false" long-clickable="false" password="false" selected="false"
                bounds="[335,1112][746,1189]" />
            </node>
            <node index="1" text="" resource-id="" class="android.view.View"
              package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
              clickable="true" enabled="false" focusable="false" focused="false" scrollable="false"
              long-clickable="false" password="false" selected="false" bounds="[84,1232][996,1358]">
              <node index="0" text="Start Quiz" resource-id="" class="android.widget.TextView"
                package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
                clickable="false" enabled="true" focusable="false" focused="false"
                scrollable="false" long-clickable="false" password="false" selected="false"
                bounds="[411,1256][669,1333]" />
              <node index="1" text="" resource-id="" class="android.widget.Button"
                package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
                clickable="false" enabled="true" focusable="false" focused="false"
                scrollable="false" long-clickable="false" password="false" selected="false"
                bounds="[84,1235][996,1354]" />
            </node>
          </node>
        </node>
      </node>
    </node>
    <node index="1" text="" resource-id="android:id/statusBarBackground" class="android.view.View"
      package="almouro.compose.quiz" content-desc="" checkable="false" checked="false"
      clickable="false" enabled="true" focusable="false" focused="false" scrollable="false"
      long-clickable="false" password="false" selected="false" bounds="[0,0][1080,132]" />
    <node index="2" text="" resource-id="android:id/navigationBarBackground"
      class="android.view.View" package="almouro.compose.quiz" content-desc="" checkable="false"
      checked="false" clickable="false" enabled="true" focusable="false" focused="false"
      scrollable="false" long-clickable="false" password="false" selected="false"
      bounds="[0,2337][1080,2400]" />
  </node>
</hierarchy>`;

describe("cleanupViewHierarchy", () => {
  test("should remove all actions from the view hierarchy", () => {
    expect(cleanupViewHierarchy(sample, true)).toMatchInlineSnapshot(`
"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hierarchy>
  <node type="android.widget.FrameLayout" bounds="left:0,top:0,right:1080,bottom:2400">
    <node type="android.widget.LinearLayout" bounds="left:0,top:0,right:1080,bottom:2337">
      <node type="android.widget.FrameLayout" bounds="left:0,top:132,right:1080,bottom:2337">
        <node type="androidx.compose.ui.platform.ComposeView" bounds="left:0,top:132,right:1080,bottom:2337">
          <node type="android.view.View" bounds="left:0,top:132,right:1080,bottom:2337">
            <node type="android.widget.EditText" bounds="left:335,top:1088,right:746,bottom:1214" clickable>
              <node type="android.widget.TextView" bounds="left:335,top:1112,right:746,bottom:1189" text="Enter your name"></node>
            </node>
            <node type="android.view.View" bounds="left:84,top:1232,right:996,bottom:1358" clickable>
              <node type="android.widget.TextView" bounds="left:411,top:1256,right:669,bottom:1333" text="Start Quiz"></node>
              <node type="android.widget.Button" bounds="left:84,top:1235,right:996,bottom:1354"></node>
            </node>
          </node>
        </node>
      </node>
    </node>
    <node type="android.view.View" bounds="left:0,top:0,right:1080,bottom:132"></node>
    <node type="android.view.View" bounds="left:0,top:2337,right:1080,bottom:2400"></node>
  </node>
</hierarchy>
"
`);
  });
});
