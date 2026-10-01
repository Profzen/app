import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { useApp } from '../context/AppContext';
import { handleUserInviteShare } from '../utils/shareHelper';

export default function ContactActionSheet({ contact, visible, onClose, onNavigate, onDelete, onFavorite }) {
  const { t, user } = useApp();
  if (!contact) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={styles.sheetDismissArea} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
          </View>

          <TouchableOpacity 
            style={styles.sheetHeader}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              onNavigate('ContactProfileScreen');
            }}
          >
             <Avatar image={contact.image} name={contact.name} size={64} style={styles.sheetAvatar} />
             <Text style={styles.sheetNameLg}>{contact.name}</Text>
             <Text style={styles.sheetLocationLg}>{contact.flag} {contact.location}</Text>
             <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#3B82F6', marginTop: 4 }}>
               {t('contacts.view_profile', 'Voir la fiche contact')} ➔
             </Text>
          </TouchableOpacity>

          <View style={styles.sheetActionsGrid}>
            <SheetGridAction icon="arrow-up-outline" label={t('contacts.action_send', 'Envoyer')} color="#10B981" bgColor="#ECFDF5" onPress={() => { onClose(); onNavigate('SendMoneyScreen'); }} />
            <SheetGridAction icon="cash-outline" label={t('contacts.action_request', 'Demander')} color="#F59E0B" bgColor="#FFF7E6" onPress={() => { onClose(); onNavigate('ReceiveFundsV2Screen'); }} />
            <SheetGridAction icon="bag-handle-outline" label={t('contacts.action_pay', 'Payer')} color="#3B82F6" bgColor="#EFF6FF" onPress={() => { onClose(); onNavigate('ChooseServiceScreen'); }} />
            <SheetGridAction 
              icon="person-add-outline" 
              label={t('contacts.action_invite', 'Inviter')} 
              color="#8B5CF6" 
              bgColor="#F5F3FF" 
              onPress={() => {
                onClose();
                setTimeout(() => {
                  handleUserInviteShare(user, contact);
                }, 350);
              }} 
            />
          </View>

          <View style={styles.sheetListGroup}>
             <SheetListAction icon="person-circle-outline" label={t('contacts.view_profile', 'Voir la fiche profil')} color="#3B82F6" bgColor="#EFF6FF" onPress={() => { onClose(); onNavigate('ContactProfileScreen'); }} />
             <SheetListAction icon="star" label={t('contacts.action_add_favorite', 'Ajouter aux favoris')} color="#F59E0B" bgColor="#FEF3C7" onPress={() => { onClose(); onFavorite(contact); }} />
             <SheetListAction icon="pencil" label={t('contacts.action_edit', 'Modifier le contact')} color="#3B82F6" bgColor="#EFF6FF" onPress={() => { onClose(); onNavigate('EditBeneficiaryScreen', { isEditing: true, beneficiary: contact }); }} />
             <SheetListAction icon="trash" label={t('contacts.action_delete', 'Supprimer le contact')} color="#EF4444" bgColor="#FEF2F2" onPress={() => { onClose(); onDelete(contact.id); }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SheetGridAction({ icon, label, color, bgColor, onPress }) {
  return (
    <TouchableOpacity style={styles.gridActionBtn} onPress={onPress}>
      <View style={[styles.gridActionIconWrap, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.gridActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function SheetListAction({ icon, label, onPress, color = '#64748B', bgColor = '#F1F5F9' }) {
  return (
    <TouchableOpacity style={styles.listActionBtn} onPress={onPress}>
      <View style={[styles.listActionIconWrap, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.listActionLabel, color === '#EF4444' && { color: '#EF4444' }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  sheetNameLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 4,
  },
  sheetLocationLg: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  sheetActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridActionBtn: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridActionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridActionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#334155',
    textAlign: 'center',
  },
  sheetListGroup: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listActionLabel: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B',
  },
});
