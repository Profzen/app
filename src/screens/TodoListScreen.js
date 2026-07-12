import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';

const initialTodos = [
  { id: '1', title: 'Acheter un cadeau pour Abdou', category: 'Paiement', due: "Aujourd'hui", done: false, icon: 'bag-handle-outline', color: '#8B5CF6' },
  { id: '2', title: 'Recharger le portefeuille', category: 'Portefeuille', due: 'Cette semaine', done: false, icon: 'wallet-outline', color: '#EF4444' },
  { id: '3', title: 'Compléter mon profil', category: 'Sécurité', due: 'Avant vendredi', done: true, icon: 'shield-checkmark-outline', color: '#3B82F6' },
  { id: '4', title: 'Créer ma boutique DZYStore', category: 'Business', due: 'Ce mois-ci', done: false, icon: 'storefront-outline', color: '#F59E0B' },
];

export default function TodoListScreen() {
  const navigation = useNavigation();
  const [todos, setTodos] = useState(initialTodos);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [toast, setToast] = useState(false);
  const addTodo = () => {
    if (!title.trim()) return;
    setTodos((items) => [{ id: Date.now().toString(), title: title.trim(), category: 'Personnel', due: 'À planifier', done: false, icon: 'checkmark-circle-outline', color: '#10B981' }, ...items]);
    setTitle(''); setShowForm(false); setToast(true);
  };
  const pending = todos.filter((todo) => !todo.done).length;
  return <SafeAreaView style={styles.safeArea}><View style={styles.container}>
    <View style={styles.header}><TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#1A2840" /></TouchableOpacity><View style={{flex:1}}><Text style={styles.title}>Ma To-do list</Text><Text style={styles.subtitle}>{pending} actions à réaliser</Text></View><TouchableOpacity style={styles.addHeader} onPress={() => setShowForm(true)} accessibilityLabel="Créer une tâche"><Ionicons name="add" size={24} color="#1A2840" /></TouchableOpacity></View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.summary}><View><Text style={styles.summaryLabel}>Votre progression</Text><Text style={styles.summaryValue}>{todos.length - pending}/{todos.length} terminées</Text></View><View style={styles.progress}><View style={[styles.progressFill,{width:`${todos.length ? ((todos.length-pending)/todos.length)*100 : 0}%`}]} /></View></View>
      {showForm && <View style={styles.form}><Text style={styles.formTitle}>Nouvelle tâche</Text><TextInput style={styles.input} placeholder="Que souhaitez-vous faire ?" value={title} onChangeText={setTitle} autoFocus /><View style={styles.formActions}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelText}>Annuler</Text></TouchableOpacity><TouchableOpacity style={[styles.save,!title.trim()&&{opacity:.45}]} onPress={addTodo} disabled={!title.trim()}><Ionicons name="save-outline" size={18} color="#1A2840" /><Text style={styles.saveText}>Sauvegarder</Text></TouchableOpacity></View></View>}
      <Text style={styles.sectionTitle}>Toutes les tâches</Text>
      {todos.map((todo) => <TouchableOpacity key={todo.id} style={styles.todo} onPress={() => setTodos((items) => items.map((item) => item.id===todo.id?{...item,done:!item.done}:item))}><View style={[styles.todoIcon,{backgroundColor:`${todo.color}18`}]}><Ionicons name={todo.icon} size={22} color={todo.color} /></View><View style={{flex:1}}><Text style={[styles.todoTitle,todo.done&&styles.done]}>{todo.title}</Text><Text style={styles.todoMeta}>{todo.category} • {todo.due}</Text></View><Ionicons name={todo.done?'checkmark-circle':'ellipse-outline'} size={24} color={todo.done?'#10B981':'#CBD5E1'} /></TouchableOpacity>)}
      <TouchableOpacity style={styles.createBtn} onPress={() => setShowForm(true)}><Ionicons name="add-circle-outline" size={21} color="#1A2840" /><Text style={styles.createText}>Créer une nouvelle tâche</Text></TouchableOpacity>
    </ScrollView><BottomNavBar activeTab="Home" /><AppToast visible={toast} title="Tâche sauvegardée" message="Elle a été ajoutée à votre To-do list." onClose={() => setToast(false)} />
  </View></SafeAreaView>;
}

const styles=StyleSheet.create({safeArea:{flex:1,backgroundColor:'#F8FAFC'},container:{flex:1},header:{flexDirection:'row',alignItems:'center',padding:18,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#EEF2F7'},back:{width:42,height:42,borderRadius:14,alignItems:'center',justifyContent:'center',marginRight:12},title:{fontFamily:'SpaceGrotesk_700Bold',fontSize:25,color:'#1A2840'},subtitle:{fontFamily:'Inter_400Regular',fontSize:13,color:'#64748B'},addHeader:{width:44,height:44,borderRadius:14,backgroundColor:'#FFC759',alignItems:'center',justifyContent:'center'},content:{padding:16,paddingBottom:35},summary:{backgroundColor:'#1A2840',borderRadius:20,padding:18,marginBottom:18},summaryLabel:{fontFamily:'Inter_500Medium',color:'#CBD5E1'},summaryValue:{fontFamily:'SpaceGrotesk_700Bold',fontSize:22,color:'#FFF',marginTop:4},progress:{height:7,borderRadius:4,backgroundColor:'#334155',marginTop:14,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:'#FFC759'},form:{backgroundColor:'#FFF',borderRadius:18,padding:16,borderWidth:1,borderColor:'#F2C15B',marginBottom:18},formTitle:{fontFamily:'SpaceGrotesk_700Bold',fontSize:18,color:'#1A2840',marginBottom:10},input:{height:50,borderWidth:1,borderColor:'#E2E8F0',borderRadius:13,paddingHorizontal:14,fontFamily:'Inter_400Regular',outlineStyle:'none'},formActions:{flexDirection:'row',justifyContent:'flex-end',marginTop:12,gap:8},cancel:{padding:12},cancelText:{fontFamily:'Inter_600SemiBold',color:'#64748B'},save:{flexDirection:'row',alignItems:'center',backgroundColor:'#FFC759',borderRadius:12,paddingHorizontal:15,paddingVertical:11,gap:7},saveText:{fontFamily:'Inter_700Bold',color:'#1A2840'},sectionTitle:{fontFamily:'SpaceGrotesk_700Bold',fontSize:19,color:'#1A2840',marginBottom:10},todo:{flexDirection:'row',alignItems:'center',backgroundColor:'#FFF',borderRadius:16,padding:14,marginBottom:10,borderWidth:1,borderColor:'#EEF2F7'},todoIcon:{width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center',marginRight:12},todoTitle:{fontFamily:'Inter_600SemiBold',fontSize:14,color:'#1A2840'},done:{textDecorationLine:'line-through',color:'#94A3B8'},todoMeta:{fontFamily:'Inter_400Regular',fontSize:11,color:'#64748B',marginTop:4},createBtn:{height:54,borderRadius:16,borderWidth:1.5,borderColor:'#FFC759',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginTop:8},createText:{fontFamily:'Inter_700Bold',color:'#1A2840'}});
