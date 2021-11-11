import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Link, NativeRouter, Route } from 'react-router-native'
import { UseContext } from './hooks/UseContext'
import Cart from './pages/Cart'
import Home from './pages/Home'
import * as SQLite from 'expo-sqlite'
import { useEffect } from 'react'
import { Icon } from 'react-native-elements/dist/icons/Icon'

const db = SQLite.openDatabase('db.testDb')

const App = () => {
  const createTable = () => {
    db.transaction(txn => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS barang (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nama VARCHAR(45),
          jumlah INTEGER(11),
          harga INTEGER(11),
          ambil INTEGER(1) DEFAULT(0))`,
        [],
        (req,res) => {
          // console.log('table created');
        },
        error => {
          console.log('error create' + error.message);
        }
      )
    })
  }

  useEffect(async()=>{
    await createTable();
  },[])
  return (
    <UseContext.Provider value={{
      db: db
    }}>
      <NativeRouter>
        <View style={styles.container}>
          <StatusBar backgroundColor="orange"/>
          <Route exact path="/" component={Home}/>
          <Route path="/cart" component={Cart}/>
          <View style={styles.nav}>
            <Link to="/" style={styles.navItem}>
              <Icon name="home" type="antdesign" color="white" size={36}/>
            </Link>
            <Link to="/cart" style={styles.navItem}>
              <Icon name="shoppingcart" type="antdesign" color="white" size={36}/>
            </Link>
          </View>
        </View>
      </NativeRouter>
    </UseContext.Provider>
  )
}

export default App

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingTop:40,
    backgroundColor:'#c3ebd9',
    color: '#000000'
  },
  nav: {
    flexDirection:'row',
    justifyContent:'space-around',
    backgroundColor:'orange',
    height: 50,
    alignItems:'center',
  },
  navItem: {
    backgroundColor: 'orange',
  }
})
