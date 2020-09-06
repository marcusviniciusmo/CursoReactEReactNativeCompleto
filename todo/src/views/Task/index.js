import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Image,
    Text,
    TextInput,
    KeyboardAvoidingView,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator
} from 'react-native';
import * as Network from 'expo-network';

import styles from './styles';
import api from '../../services/api';

// COMPONENTES
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import typeIcons from '../../utils/typeIcons';
import DateTimeInput from '../../components/DateTimeInput';

export default function Task({ navigation }) {
    const [id, setId] = useState();
    const [done, setDone] = useState(false);
    const [type, setType] = useState();
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();
    const [date, setDate] = useState();
    const [hour, setHour] = useState();
    const [macaddress, setMacaddress] = useState('11:11:11:11:11:11');
    const [load, setLoad] = useState(true);

    async function New(){
        if(!type)
            return Alert.alert('Escolha um tipo para a tarefa.');

        if(!title)
            return Alert.alert('Defina o nome da tarefa.');

        if(!description)
            return Alert.alert('Defina a descrição da tarefa.');

        if(!date)
            return Alert.alert('Escolha uma data para a tarefa.');
        
        if(!hour)
            return Alert.alert('Escolha uma hora para a tarefa.');

        await api.post('/task', {
            macaddress,
            type,
            title,
            description,
            when: `${date}T${hour}.000`
        }).then(() => {
            navigation.navigate('Home');
        })
    }

    async function LoadTask(){
        await api.get(`/task/${id}`).then(response => {
            setLoad(true);
            setDone(response.data.done);
            setType(response.data.type);
            setTitle(response.data.title);
            setDescription(response.data.description);
            setDate(response.data.when);
            setHour(response.data.when);
        });
    }

    async function getMacAddress(){
        await Network.getMacAddressAsync().then(mac => {
            setMacaddress(mac);
            setLoad(false);
        }); 
    }

    useEffect(() => {
        getMacAddress();

        if(navigation.state.params){
            setId(navigation.state.params.idTask)
            LoadTask().then(() => setLoad(false))
        }
        
        
    });

    return (
        <KeyboardAvoidingView behavior='padding' style={styles.container}>
            <Header showBack={true} navigation={navigation} />
            {
                load ?
                <ActivityIndicator color={'#EE6B26'} size={50} style={{marginTop: 150}}/>
                :
                <ScrollView style={{ width: '100%' }}>
                    <ScrollView horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={{marginVertical: 10}}>
                        {
                            typeIcons.map((icon, index) => (
                                icon != null &&
                                <TouchableOpacity onPress={() => setType(index)}>
                                <Image source={icon} 
                                    style={[styles.imageIcon, 
                                    type && type != index && styles.typeIconInative]}/>
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>

                    <Text style={styles.label}>Título</Text>
                    <TextInput
                        style={styles.input}
                        maxLength={30}
                        placeholder="Lembre-me de fazer..."
                        onChangeText={(text) => setTitle(text)}
                        value={title} />

                    <Text style={styles.label}>Detalhes</Text>
                    <TextInput
                        style={styles.inputArea}
                        maxLength={200}
                        multiline={true}
                        placeholder="Detalhes da atividade que eu tenho que eu lembrar..."
                        onChangeText={(text) => setDescription(text)}
                        value={description} />

                    <DateTimeInput type={'date'} save={setDate} date={date}/>
                    <DateTimeInput type={'hour'} save={setHour} hour={hour}/>

                    {
                    id &&
                    <View style={styles.inLine}>
                        <View style={styles.inputInLine}>
                            <Switch onValueChange={() =>
                                setDone(!done)}
                                value={done}
                                thumbColor={done ? '#00761B' : '#EE6B26'} />
                            <Text style={styles.switchLabel}>concluído</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.removeLabel}>excluir</Text>
                        </TouchableOpacity>
                    </View>
                    }
                </ScrollView>
            }
            <Footer icon={'save'} onPress={New}/>
        </KeyboardAvoidingView>
    )
}