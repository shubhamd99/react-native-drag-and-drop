import React from "react";
import { StyleSheet, View, Text, StatusBar, FlatList, Animated, PanResponder, PanResponderInstance } from "react-native";

interface IAppState {
	dragging: boolean;
	draggingIndex: number;
	data: number[];
}

function getRandomColorCode() {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color;
}

const colorMap: {[key: string]: string} = {};

class App extends React.Component<any, IAppState> {

	private _panResponder: PanResponderInstance;
	private point: Animated.ValueXY = new Animated.ValueXY();
	private scrollOffset = 0;
	private flatListTopOffset = 0;
	private rowHeight = 0;
	private currentIndex = -1;
	private currentY = 0;
	private active = false;

	public constructor(props: any) {
		super(props);
		this.state = {
			dragging: false,
			draggingIndex: -1,
			data: Array.from(Array(200), (_, index) => {
				colorMap[index] = getRandomColorCode();
				return index;
			}),
		};

		this._panResponder = PanResponder.create({
			// Ask to be the responder:
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

			onPanResponderGrant: (evt, gestureState) => {
				// The gesture has started. Show visual feedback so the user knows what is happening!
				// gestureState.d{x,y} will be set to zero now
				this.currentIndex = this.yToIndex(gestureState.y0);
				this.currentY = gestureState.y0;
				this.active = true;
				Animated.event([{y : this.point.y}], {useNativeDriver: false})({ y: gestureState.y0 - this.rowHeight / 2 });
				this.setState({ dragging: true, draggingIndex: this.currentIndex }, () => this.animateList());
			},
			onPanResponderMove: (evt, gestureState) => {
				// The most recent move distance is gestureState.move{x,y}
				// The accmulated gesture distance since becoming responder is gestureState.d{x,y}
				// console.log("onPanResponderMove ", gestureState.moveY);
				this.currentY = gestureState.moveY;
				Animated.event([{y : this.point.y}], {useNativeDriver: false})({ y: gestureState.moveY });
			},
			onPanResponderTerminationRequest: (evt, gestureState) => false,
			onPanResponderRelease: (evt, gestureState) => {
				// The user has released all touches while this view is the responder.
				// this typically means a gesture has succeded
				this.reset();
			},
			onPanResponderTerminate: (evt, gestureState) => {
				// Another component has become the responder, so this gesture should be cancelled
				this.reset();
			},
			onShouldBlockNativeResponder: (evt, gestureState) => {
				// Returns whether this component should block native components from becoming the JS responder.
				// Returns true by default. Is currenlty only supported on android.
				return true;
			},
		});
	}

	public render() {
		const { data, dragging, draggingIndex } = this.state;
		return (
			<>
				<StatusBar barStyle="dark-content" />
				<View style={styles.container}>
					{dragging && <Animated.View style={[styles.animatedView, { top: this.point.getLayout().top }]}>
						{this.renderList({ item: data[draggingIndex], index: -1 }, true)}
					</Animated.View>}
					<FlatList
						scrollEnabled={!dragging}
						style={{ width: "100%" }}
						data={data}
						renderItem={this.renderList}
						keyExtractor={item => String(item)}
						onScroll={e => this.scrollOffset = e.nativeEvent.contentOffset.y}
						onLayout={e => this.flatListTopOffset = e.nativeEvent.layout.y}
						scrollEventThrottle={16}
					/>
				</View>
			</>
		);	
	}

	private renderList = (data: any, noPanResponder = false) => {
		const { item, index } = data;
		return (
			<View
			onLayout={e => this.rowHeight = e.nativeEvent.layout.height}
			style={{
				padding: 16, backgroundColor: colorMap[item], flexDirection: "row",
				opacity: this.state.draggingIndex === index ? 0 : 1
			}}>
				<View {...(noPanResponder ? {} : this._panResponder.panHandlers)}>
					<Text style={styles.title}>@</Text>
				</View>
				<Text style={[styles.title, { textAlign: "center", flex: 1 }]}>{item}</Text>
			</View>
		);
	}

	private reset = () => {
		this.active = false;
		this.setState({ dragging: false, draggingIndex: -1 });
	}

	private yToIndex = (y: number) => {
		const value = Math.floor((this.scrollOffset + y - this.flatListTopOffset) / this.rowHeight);

		if (value < 0) {
			return 0;
		}

		if (value > this.state.data.length - 1) {
			return this.state.data.length - 1;
		}

		return value;
	}

	private animateList = () => {
		if (!this.active) {
			return;
		}
		// The window.requestAnimationFrame() method tells the browser that you wish to perform an animation
		// and requests that the browser calls a specified function to update an animation before the next repaint.
		// The method takes a callback as an argument to be invoked before the repaint.
		// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
		requestAnimationFrame(() => {
			// Check Y value see if need to be reorder
			const newIndex = this.yToIndex(this.currentY);
			if (this.currentIndex !== newIndex) {
				const reorderedData = this.swapArray<number>(this.state.data, this.currentIndex, newIndex);
				this.setState({ data: reorderedData, draggingIndex: newIndex });
				this.currentIndex = newIndex;
			}
			this.animateList();
		});
	}

	private swapArray<T>(items: T[], currentIndex: number, newIndex: number): T[] {
		const itemA: T = items[currentIndex];
		const clone: T[] = [...items];

		clone[currentIndex] = clone[newIndex];
		clone[newIndex] = itemA;

		return clone;
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		alignItems: "center",
	},
	title : {
		fontSize: 22
	},
	animatedView: {
		position: "absolute",
		backgroundColor: "black",
		zIndex: 2,
		width: "100%",
	}
});

export default App;
