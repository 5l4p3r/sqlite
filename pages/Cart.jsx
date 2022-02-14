import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, } from 'react-native'
import { Button, Icon, ListItem,Overlay,Text } from 'react-native-elements'
import { UseContext } from '../hooks/UseContext'

const Cart = () => {
    const {db} = useContext(UseContext)
    const [barang, setBarang] = useState([])
    const [load, setLoad] = useState(false)
    const [vtotal, setVtotal] = useState(false)
    const [total, setTotal] = useState([])
    const [del, setDel] = useState(false)
    const [id, setId] = useState(0)
    const [reset, setReset] = useState(false)

    const getData = async() => {
        db.transaction(txn => {
            txn.executeSql(
                `SELECT id, nama, jumlah, harga, (jumlah * harga) AS subtotal FROM barang WHERE ambil = 1 ORDER BY nama ASC`,
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

    const hapus = () => {
        db.transaction(tx=>{
            tx.executeSql(
                `DELETE FROM barang WHERE id = ?`,
                [id],
                (req,res)=>{
                    // console.log('Berhasil Dihapus' + res);
                    setId(0)
                    setDel(false)
                },
                error=> {
                    console.log('Gak bisa hapus karena '+ error.message);
                }
            )
        })
    }

    const ResetToList = () => {
        db.transaction(tx=>{
            tx.executeSql(
                `UPDATE barang SET ambil = ?`,
                [0],
                (res)=>{
                    setReset(false)
                    getData();
                    jumlah();
                }
            )
        })
    }

    const jumlah = async() => {
        db.transaction(tx=>{
            tx.executeSql(
                `SELECT (SUM(harga * jumlah)) AS total FROM barang WHERE ambil = 1`,
                [],
                async(req, res)=> {
                    if(res.rows.length > 0){
                        setTotal(JSON.stringify(res.rows._array))
                        setVtotal(true)
                    }else{
                        setVtotal(false)
                    }
                },
                error=>{
                    console.log(error.message);
                }
            )
        })
    }

    useEffect(()=>{
        getData();
        jumlah();
    },[])
    return (
        <View style={styles.container}>
            <View style={{flexDirection:'row', justifyContent:'space-between',paddingVertical:10}}>
                {vtotal && JSON.parse(total).map((item,i)=>(
                    <Text h4 style={{marginHorizontal:10,marginVertical:10}} key={i}>{item.total > 0 ? 'Total Rp' : 'Belum ambil apapun'} {item.total}</Text>
                ))}
                <Button
                    onPress={()=>{
                        setReset(true)
                    }}
                    type="clear" 
                    icon={<Icon type="antdesign" name="back"/>}
                />
            </View>

            <ScrollView>
                {load && JSON.parse(barang).map((item,i)=>(
                    <ListItem key={i} 
                        containerStyle={{
                            borderRadius:5,
                            marginVertical:5,
                            borderWidth:1,
                            backgroundColor:'#fff9',
                            borderColor:'orange'}}>
                        <Text>{i+1}</Text>
                        <ListItem.Content>
                            <ListItem.Title>{item.nama}</ListItem.Title>
                            <ListItem.Subtitle>Price Rp {item.harga}</ListItem.Subtitle>
                        </ListItem.Content>
                        <ListItem.Content>
                            <ListItem.Subtitle>QTY {item.jumlah} pc</ListItem.Subtitle>
                            <ListItem.Subtitle>Sub Rp {item.subtotal}</ListItem.Subtitle>
                        </ListItem.Content>
                        <Button type="clear"
                            icon={<Icon name="delete" color="red" type="antdesign"/>}
                            onPress={()=>{
                                setId(item.id)
                                setDel(true)
                            }}
                        />
                    </ListItem>
                ))}
            </ScrollView>
            <Overlay isVisible={del} 
                onBackdropPress={()=>{
                    setDel(false)
                }}
            >
                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                    <Button title="Yes" type="clear" onPress={()=>{
                        hapus();
                        getData();
                        jumlah();
                    }}/>
                    <Button title="No" type="clear" onPress={()=>setDel(false)}/>
                </View>
            </Overlay>

            <Overlay isVisible={reset} onBackdropPress={()=>{
                    setReset(false)
                }}>
                    <Text h4 style={{width:300,marginBottom:10,textAlign:'center'}}>Reset ke List Belanja?</Text>
                    <Button type="clear" title="Iya" onPress={()=>{
                        ResetToList()
                    }}/>
                    <Button type="clear" title="Tidak" onPress={()=>{
                        setReset(false)
                        setId(0)
                    }}/>
            </Overlay>
        </View>
    )
}

export default Cart

const styles = StyleSheet.create({
    container: {
        flex:1,
        paddingHorizontal:10
    }
})
