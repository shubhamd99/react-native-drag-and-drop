#### React Native Drag And Drop

![alt video](https://i.imgur.com/kOvdB6b.mp4)

* Pan Responder - https://reactnative.dev/docs/panresponder

* PanResponder reconciles several touches into a single gesture. It makes single-touch gestures resilient to extra touches, and can be used to recognize basic multi-touch gestures.

* By default, PanResponder holds an InteractionManager handle to block long-running JS events from interrupting active gestures.

* It provides a predictable wrapper of the responder handlers provided by the gesture responder system. For each handler, it provides a new gestureState object alongside the native event object:

```
onPanResponderMove: (event, gestureState) => {}
```

* A native event is a synthetic touch event with form of PressEvent.

* A gestureState object has the following:

1. stateID - ID of the gestureState- persisted as long as there at least one touch on screen
2. moveX - the latest screen coordinates of the recently-moved touch
3. moveY - the latest screen coordinates of the recently-moved touch
4. x0 - the screen coordinates of the responder grant
5. y0 - the screen coordinates of the responder grant
6. dx - accumulated distance of the gesture since the touch started
7. dy - accumulated distance of the gesture since the touch started
8. vx - current velocity of the gesture
9. vy - current velocity of the gesture
10. numberActiveTouches - Number of touches currently on screen

* Example Component
```
const ExampleComponent = () => {
  const panResponder = React.useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) =>
        true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
        true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) =>
        true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      }
    })
  ).current;

  return <View {...panResponder.panHandlers} />;
};
```

* Window.requestAnimationFrame()

The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint. https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame