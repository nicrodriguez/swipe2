import React, { Component } from 'react';
import { View, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
    static defaultProps = {
        onSwipeRight: () => {},
        onSwipeLeft: () => {}
    }

    constructor(props) {
        super(props);

        this.lastY = 0;
        const position = new Animated.ValueXY();
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,

            // Logic to happen during gesture
            onPanResponderMove: (event, gesture) => {
                this.lastY += gesture.dy;
                position.setValue({ x: gesture.dx, y: gesture.dy });
            },

            // When user stops the gesture
            onPanResponderRelease: (event, gesture) => {

                if (gesture.dx > SWIPE_THRESHOLD) { // If user swipes right
                    this.forceSwipe('right', gesture);
                } else if (gesture.dx < -SWIPE_THRESHOLD) { // If user swipes left
                    this.forceSwipe('left', gesture);
                }else {
                    this.resetPosition();
                }
            }
        });

        this.state = { position, index: 0 }; //This could also be this.position = position
    }

    forceSwipe(direction, gesture) {
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(this.state.position, {
            toValue: { x, y: 0 },
            duration: SWIPE_OUT_DURATION
        }).start(() => this.onSwipeComplete(direction)); // After animation is complete onSwipeComplete is called
    }

    onSwipeComplete(direction) {
        const { onSwipeLeft, onSwipeRight, data } = this.props;
        const item = data[this.state.index];

        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
        this.state.position.setValue({ x: 0, y: 0 }); // resets position of object before attaching to next card
        this.setState({ index: this.state.index + 1 });
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: {x: 0, y: 0}
        }).start();
    }

    getCardStyle() {
        const { position } = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 2, 0, SCREEN_WIDTH * 2],
            outputRange: ['-120deg', '0deg', '120deg']
        });

        return {
            ...position.getLayout(), //returns object x-y position
            transform: [{ rotate }]
        };
    }

    renderCards() {
        
        if (this.state.index >= this.props.data.length) {
            return this.props.renderNoMoreCards();
        }

        return this.props.data.map((item, i) => {

            if (i < this.state.index) { return null; }

            if (i === this.state.index) {
                return (
                    /* Animates the current card */
                    <Animated.View
                        key={item.id}
                        style={this.getCardStyle()}
                        {...this.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            }

            return this.props.renderCard(item);
        });
    }

    render() {
        return (
          <View>
              {this.renderCards()}
          </View>
        );
    }
}

export default Deck;
