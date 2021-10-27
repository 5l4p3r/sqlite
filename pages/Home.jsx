import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View} from 'react-native'
import { Button, Icon, Input, ListItem, Overlay, Text} from 'react-native-elements'
// import AsyncStorage from '@react-native-async-storage/async-storage'
import PTRView from 'react-native-pull-to-refresh'
import { UseContext } from '../hooks/UseContext'

const Home = () => {
    const {db} = useContext(UseContext)
    const [barang, setBarang] = useState([])
    const [nama,setNama] = useState('')
    const [harga, setHarga] = useState(0)
    const [id, setId] = useState(0)
    const [sudah, setSudah] = useState(false)
    const [load, setLoad] = useState(false)

    const filtered = (all) => {
        return all.nama.toUpperCase().indexOf(search.toUpperCase()) > -1
    }

    const createCart = () => {
        db.transaction(txn => {
            txn.executeSql(
                `INSERT INTO barang (id,nama,harga,ambil) VALUES (?,?,?,?)`,
                [null,nama,harga,0],
                (txn,res)=>{
                    setNama('')
                    setHarga(0)
                    setOpen(false)
                },
                error => {
                    console.log('GAGAL ' + error.message, nama, harga);
                }
            )
        })
    }

    const getData = async() => {
        db.transaction(txn => {
            txn.executeSql(
                `SELECT * FROM barang WHERE ambil = 0 ORDER BY nama`,
                [],
                async(req,res) => {
                    if(res.rows.length > 0){
                        setBarang(JSON.stringify(res.rows._array))
                        setLoad(true)
                    }else{
                        setLoad(false)
                    }
                },
                error => {
                    console.log('GAGAL ' + error.message);
                }
            )
        })
    }

    const setCookies = async() => {
        try {
            await AsyncStorage.setItem('@barang', JSON.stringify(barang))
        } catch (error) {
            console.log(error.message);
        }
    }

    const getCookies = async() => {
        try {
            const getBarang = await AsyncStorage.getItem('@barang')
            if(getBarang !== null){
                setBarang(getBarang)
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    const ambilBarang = () => {
        db.transaction(txn => {
            txn.executeSql(
                `UPDATE barang SET ambil = ? WHERE id = ? `,
                [1, id],
                (res)=>{
                    console.log('Berhasil '+ res);
                    setId(0)
                    setSudah(false)
                    getData()
                },
                error=>{
                    console.log(error.message);
                }
            )
        })
    }

    useEffect(()=>{
        getData();
    },[])

    const [open,setOpen] = useState(false)
    const [search, setSearch] = useState('')
    return (
        <View style={styles.container}>
            <Input
            containerStyle={{backgroundColor:'#fff7', marginVertical:10, height:60, borderRadius:5}}
            rightIcon={<Icon name="closecircleo" type="antdesign" onPress={()=>setSearch('')}/>}
            placeholder="Search.."
            value={search}
            onChangeText={(e)=>{
                setSearch(e)
            }}/>

            <Button
            type="solid"
            buttonStyle={{borderRadius:5,marginBottom:10, backgroundColor:'orange'}}
            onPress={()=>setOpen(true)}
            icon={
                <Icon name="shoppingcart" type="antdesign" color="#fff" size={20}/>
            }/>

            <Overlay isVisible={open}
            onBackdropPress={()=>{
                setOpen(false)
            }}>
                <Text h4>Create Cart</Text>
                <Input placeholder="Name" containerStyle={{ width:300 }} onChangeText={(e)=>setNama(e)}/>
                <Input keyboardType='numeric' placeholder="Price" containerStyle={{ width:300 }} onChangeText={(e)=>setHarga(e)}/>
                <Button type="solid" buttonStyle={{backgroundColor:'orange'}} icon={<Icon name="addfile" type="antdesign" color="#fff"/>} onPress={()=>{
                    createCart();
                    getData();
                }}/>
            </Overlay>
            <ScrollView>
                {load && JSON.parse(barang).filter(filtered).map((item,i)=>(
                    <ListItem key={i}>
                        <Text>{i+1}</Text>
                        <ListItem.Content>
                            <ListItem.Title>{item.nama}</ListItem.Title>
                            <ListItem.Subtitle>Rp {item.harga}</ListItem.Subtitle>
                        </ListItem.Content>
                        <Button type="clear"
                            icon={<Icon name="shoppingcart" type="antdesign"/>}
                            onPress={()=>{
                                setSudah(true);
                                setId(item.id);
                            }}/>
                    </ListItem>
                ))}
            </ScrollView>
            <Overlay isVisible={sudah} onBackdropPress={()=>{
                setSudah(false)
                setId(0)
            }}>
                <Text h4>Ambil??</Text>
                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                    <Button type="clear" title="YES" onPress={ambilBarang}/>
                    <Button type="clear" title="NO" onPress={()=>{
                        setSudah(false)
                        setId(0)
                    }}/>
                </View>
            </Overlay>
        </View>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal:8,
    },
    add: {
        padding: 5,
    }
})
