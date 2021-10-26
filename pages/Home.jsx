import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View} from 'react-native'
import { Button, Icon, Input, ListItem, Overlay, Text} from 'react-native-elements'
import PTRView from 'react-native-pull-to-refresh'
import { UseContext } from '../hooks/UseContext'

const Home = () => {
    const {db} = useContext(UseContext)
    const [barang, setBarang] = useState([])
    const [nama,setNama] = useState('')
    const [harga, setHarga] = useState(0)
    const [id, setId] = useState(null)
    const [ambil, setAmbil] = useState(null)
    const [sudah, setSudah] = useState(false)
    const createCart = () => {
        db.transaction(txn => {
            txn.executeSql(
                `INSERT INTO barang (id,nama,harga,ambil) VALUES (?,?,?,?)`,
                [null,nama,harga,0],
                (txn,res)=>{
                    console.log(res);
                    console.log('berhasil');
                    setNama('')
                    setHarga(0)
                    setOpen(false)
                    getData()
                },
                error => {
                    console.log('GAGAL ' + error.message, nama, harga);
                }
            )
        })
    }

    const getData = () => {
        db.transaction(txn => {
            txn.executeSql(
                `SELECT * FROM barang WHERE ambil = 0 ORDER BY nama`,
                [],
                (req,res) => {
                    setBarang(JSON.stringify(res.rows._array))
                    console.log(barang);
                },
                error => {
                    console.log('GAGAL ' + error.message);
                }
            )
        })
    }

    const ambilBarang = () => {
        db.transaction(txn => {
            txn.executeSql(
                `UPDATE barang WHERE id = ${id} SET ambil = ${ambil}`,
                [],
                () => {
                    console.log('berhasil');
                },
                error => {
                    console.log('Gagal Ambil karena ' + error.message);
                }
            )
        })
    }

    useEffect(async()=>{
        await getData();
    },[])

    const [open,setOpen] = useState(false)
    const [search, setSearch] = useState('')
    return (
        <PTRView onRefresh={getData}>
            <View style={styles.container}>
                <Input
                containerStyle={{backgroundColor:'#363636',marginBottom:10, height:50, borderRadius:5}}
                rightIcon={<Icon name="closecircleo" type="antdesign" onPress={()=>setSearch('')}/>}
                placeholder="Search.."
                value={search}
                onChangeText={(e)=>{
                    setSearch(e)
                }}/>

                <Button
                type="outline"
                containerStyle={{borderRadius:5,marginBottom:10}}
                onPress={()=>setOpen(true)}
                icon={
                    <Icon name="shoppingcart" type="antdesign" color="orange" size={20}/>
                }/>

                <Overlay isVisible={open}
                onBackdropPress={()=>{
                    setOpen(false)
                }}>
                    <Text h4>Create Cart</Text>
                    <Input placeholder="Name" containerStyle={{ width:300 }} onChangeText={(e)=>setNama(e)}/>
                    <Input keyboardType='numeric' placeholder="Price" containerStyle={{ width:300 }} onChangeText={(e)=>setHarga(e)}/>
                    <Button type="outline" icon={<Icon name="addfile" type="antdesign" color="orange"/>} onPress={()=>{
                        createCart()
                    }}/>
                </Overlay>
                <ScrollView>
                {JSON.parse(barang).map((item,i)=>(
                    <ListItem key={i}>
                        <Text>{i+1}</Text>
                        <ListItem.Content>
                            <ListItem.Title>{item.nama}</ListItem.Title>
                            <ListItem.Subtitle>Rp {item.harga}</ListItem.Subtitle>
                        </ListItem.Content>
                        <Button type="clear"
                            icon={<Icon name="shoppingcart" type="antdesign"/>}
                            onPress={()=>{
                                setSudah(true)
                                setAmbil(1)
                                setId(item.id)
                            }}/>
                    </ListItem>
                ))}
                </ScrollView>
                <Overlay isVisible={sudah} onBackdropPress={()=>{
                    setSudah(false)
                    setAmbil(null)
                    setId(null)
                }}>
                    <Text h4>Ambil??</Text>
                    <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                        <Button type="clear" title="YES"/>
                        <Button type="clear" title="NO"/>
                    </View>
                </Overlay>
            </View>
        </PTRView>
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
