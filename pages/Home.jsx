import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View} from 'react-native'
import { Button, FAB, Icon, Input, ListItem, Overlay, Text} from 'react-native-elements'
import { UseContext } from '../hooks/UseContext'

const Home = () => {
    const {db} = useContext(UseContext)
    const [barang, setBarang] = useState([])
    const [nama,setNama] = useState('')
    const [harga, setHarga] = useState(0)
    const [id, setId] = useState(0)
    const [sudah, setSudah] = useState(false)
    const [load, setLoad] = useState(false)
    const [vtotal, setVtotal] = useState(false)
    const [total, setTotal] = useState([])
    const [edit, setEdit] = useState(false)

    const filtered = (all) => {
        return all.nama.toUpperCase().indexOf(search.toUpperCase()) > -1
    }

    const clearForm = () => {
        setId(0);
        setNama('');
        setHarga('');
    }

    const createCart = () => {
        if(nama === '' || harga === ''){
            alert('Form is empty')
        }else{
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
    }

    const editCart = () => {
        if(nama === '' || harga === ''){
            alert('Form is empty')
        }else{
            db.transaction(tx=>{
                tx.executeSql(
                    `UPDATE barang SET nama = ?, harga = ? WHERE id = ?`,
                    [nama,harga,id],
                    (res) => {
                        console.log('Berhasil Update ' + res);
                        setEdit(false);
                        clearForm();
                        getData();
                        jumlah();
                    },
                    error => {
                        console.log('Gagal Update karena ' + error.message);
                    }
                )
            })
        }
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

    const jumlah = async() => {
        db.transaction(tx=>{
            tx.executeSql(
                `SELECT (SUM(harga)) AS total FROM barang WHERE ambil = 0`,
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

    const [open,setOpen] = useState(false)
    const [search, setSearch] = useState('')
    return (
        <View style={styles.container}>
            <Input
                containerStyle={{backgroundColor:'#fff9', marginVertical:10, height:60, borderRadius:5,borderWidth:1, borderColor:'orange'}}
                rightIcon={<Icon name="closecircleo" type="antdesign" onPress={()=>setSearch('')}/>}
                placeholder="Search.."
                value={search}
                onChangeText={(e)=>{
                setSearch(e)
            }}/>

            {vtotal && JSON.parse(total).map((item,i)=>(
                <Text h4 style={{marginHorizontal:10}} key={i}>Total Rp {item.total}</Text>
            ))}

            <Overlay
                isVisible={open}
                onBackdropPress={()=>{
                setOpen(false)
                }}>
                <Text h4>Create Cart</Text>
                <Text>Nama</Text>
                <Input placeholder="Name" 
                    containerStyle={{ width:350 }} 
                    onChangeText={(e)=>setNama(e)}/>
                <Text>Harga</Text>
                <Input keyboardType='numeric'
                    placeholder="Estimate Price" 
                    containerStyle={{ width:300 }} 
                    onChangeText={(e)=>setHarga(e)}/>
                <Button type="solid" buttonStyle={{backgroundColor:'orange'}} icon={<Icon name="addfile" type="antdesign" color="#fff"/>} onPress={()=>{
                    createCart();
                    getData();
                    jumlah();
                }}/>
            </Overlay>
            {/* EDIT */}
            <Overlay isVisible={edit} onBackdropPress={()=>{
                setEdit(false);
                clearForm();
            }}>
                <Text h4>Edit</Text>
                <Text>Nama</Text>
                <Input placeholder="Name"
                    value={nama}
                    containerStyle={{ width:350 }} 
                    onChangeText={(e)=>setNama(e)}/>
                <Text>Harga</Text>
                <Input keyboardType='numeric'
                    value={harga.toString()}
                    placeholder="Estimate Price" 
                    containerStyle={{ width:300 }} 
                    onChangeText={(e)=>setHarga(e)}/>
                <Button type="solid"
                    onPress={editCart}
                    buttonStyle={{backgroundColor:'orange'}}
                    icon={<Icon type="MaterialCommunityIcons" name="update"/>} />
            </Overlay>
            <ScrollView>
                {load && JSON.parse(barang).filter(filtered).map((item,i)=>(
                    <ListItem key={i}
                        containerStyle={{borderRadius:5,marginVertical:5,borderWidth:1, borderColor:'orange'}}>
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
                        <Button type="clear"
                            onPress={()=>{
                                setEdit(true);
                                setNama(item.nama);
                                setHarga(item.harga);
                                setId(item.id);
                            }}
                            icon={<Icon type="Feather" name="edit"/>}/>
                    </ListItem>
                ))}
            </ScrollView>
            <Overlay
                isVisible={sudah} onBackdropPress={()=>{
                setSudah(false)
                setId(0)
            }}>
                <Text h4 style={{width:300,marginBottom:10,textAlign:'center'}}>Sudah ambil?</Text>
                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                    <Button type="clear" title="YES" onPress={()=>{
                        ambilBarang();
                        jumlah();
                    }}/>
                    <Button type="clear" title="NO" onPress={()=>{
                        setSudah(false)
                        setId(0)
                    }}/>
                </View>
            </Overlay>
            <FAB icon={<Icon type="antdesign" color="black" name="shoppingcart"/>} 
                color="orange"
                onPress={()=>setOpen(true)}
                style={styles.fab}/>
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
    },
    fab: {
        backgroundColor:'orange',
        position:'absolute',
        bottom:10,
        right:10
    }
})
