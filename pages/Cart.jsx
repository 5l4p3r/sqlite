import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, } from 'react-native'
import { Button, Icon, ListItem,Overlay,Text } from 'react-native-elements'
import { UseContext } from '../hooks/UseContext'

const Cart = () => {
    const {db} = useContext(UseContext)
    const [barang, setBarang] = useState([])
    const [load, setLoad] = useState(false)
    const [del, setDel] = useState(false)
    const [id, setId] = useState(0)

    const getData = async() => {
        db.transaction(txn => {
            txn.executeSql(
                `SELECT * FROM barang WHERE ambil = 1 ORDER BY nama`,
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
                    console.log('Berhasil Dihapus' + res);
                    setId(0)
                    setDel(false)
                },
                error=> {
                    console.log('Gak bisa hapus karena '+ error.message);
                }
            )
        })
    }

    useEffect(()=>{
        getData()
    },[])
    return (
        <View style={styles.container}>
            <Text h1 style={{marginHorizontal:10}}>Total Rp</Text>
            <ScrollView>
                {load && JSON.parse(barang).map((item,i)=>(
                    <ListItem key={i}>
                        <Text>{i+1}</Text>
                        <ListItem.Content>
                            <ListItem.Title>{item.nama}</ListItem.Title>
                            <ListItem.Subtitle>Rp {item.harga}</ListItem.Subtitle>
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
                    }}/>
                    <Button title="No" type="clear" onPress={()=>setDel(false)}/>
                </View>
            </Overlay>
        </View>
    )
}

export default Cart

const styles = StyleSheet.create({
    container: {
        flex:1,
    }
})
