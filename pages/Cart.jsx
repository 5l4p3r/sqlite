import React, { useContext } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { UseContext } from '../hooks/UseContext'

const Cart = () => {
    const {ts} = useContext(UseContext)
    return (
        <View style={styles.container}>
            <Text>Cart {ts}</Text>
        </View>
    )
}

export default Cart

const styles = StyleSheet.create({
    container: {
        flex:1,
    }
})
