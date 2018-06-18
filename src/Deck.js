import React, { Component } from 'react';
import { View, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
    constructor(props) {
        super(props);
        const position = new Animated.ValueXY();
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,

            // Logic to happen during gesture
            onPanResponderMove: (event, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy });
            },

            // When user stops the gesture
            onPanResponderRelease: (event, gesture) => {

                if (gesture.dx > SWIPE_THRESHOLD) { // If user swipes right
                    this.forceSwipe('right');
                } else if (gesture.dx < -SWIPE_THRESHOLD) { // If user swipes left
                    this.forceSwipe('left');
                }else {
                    this.resetPosition();
                }
            }
        });

        this.state = { position }; //This could also be this.position = position
    }

    forceSwipe(direction) {
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(this.state.position, {
            toValue: { x, y: 0 },
            duration: SWIPE_OUT_DURATION
        }).start(() => this.onSwipeComplete(direction)); // After animation is complete onSwipeComplete is called
    }

    onSwipeComplete(direction) {
        const { onSwipeLeft, onSwipeRight } = this.props;

        direction === 'right' ? onSwipeRight() : onSwipeLeft();
        
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
        return this.props.data.map((item, index) => {
            if (index === 0) {
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
