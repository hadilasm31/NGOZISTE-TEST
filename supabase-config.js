// =====================================================
// CONFIGURATION SUPABASE CENTRALISÉE - CORRIGÉ
// =====================================================

// Configuration Supabase
const SUPABASE_URL = 'https://gkvtwxnddpgoyrpedhua.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdnR3eG5kZHBnb3lycGVkaHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5ODA0MzAsImV4cCI6MjA4NzU1NjQzMH0.iTSfiOGCFky2fk6JXubFRBK8A0sVGfqMqALzD0og1KM';

// Initialiser Supabase GLOBALEMENT
const { createClient } = window.supabase;
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// AJOUT : Créer aussi supabaseClient pour la compatibilité
window.supabaseClient = window.supabase;

console.log('✅ Supabase initialisé avec succès');

// =====================================================
// FONCTIONS UTILITAIRES GLOBALES
// =====================================================

/**
 * Déconnexion de l'utilisateur
 */
window.logout = async function() {
    try {
        await window.supabase.auth.signOut();
        localStorage.removeItem('user_display');
        localStorage.removeItem('rememberedEmail');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
    }
};

/**
 * Vérifier l'utilisateur courant
 */
window.getCurrentUser = async function() {
    try {
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error || !session) {
            return { user: null, session: null };
        }
        
        const { data: userData, error: userError } = await window.supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        if (userError) {
            console.error('Erreur récupération utilisateur:', userError);
            return { user: null, session };
        }
        
        return { user: userData, session };
    } catch (error) {
        console.error('Erreur getCurrentUser:', error);
        return { user: null, session: null };
    }
};

/**
 * Connexion utilisateur
 */
window.login = async function(email, password) {
    try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            return { success: false, message: error.message };
        }
        
        if (!data.user) {
            return { success: false, message: 'Erreur de connexion' };
        }
        
        // Récupérer les infos utilisateur
        const { data: userData, error: userError } = await window.supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (userError) {
            return { success: false, message: 'Erreur récupération profil' };
        }
        
        // Mettre à jour la dernière connexion
        await window.supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);
        
        return { 
            success: true, 
            data: { 
                user: userData,
                session: data.session 
            } 
        };
    } catch (error) {
        console.error('Erreur login:', error);
        return { success: false, message: 'Erreur de connexion' };
    }
};

/**
 * Afficher une notification toast
 */
window.showToast = function(message, type = 'info', duration = 3000) {
    // Supprimer l'ancien toast s'il existe
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
    
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.color = 'white';
    toast.style.zIndex = '3000';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    toast.style.maxWidth = '300px';
    toast.style.wordWrap = 'break-word';
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.textContent = message;
    
    // Forcer un reflow
    toast.offsetHeight;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

/**
 * Formater une date
 */
window.formatDate = function(dateString, options = {}) {
    if (!dateString) return '-';
    const defaultOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    try {
        return new Date(dateString).toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
    } catch (e) {
        return dateString;
    }
};

/**
 * Tronquer un texte
 */
window.truncateText = function(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Obtenir le libellé d'une catégorie
 */
window.getCategoryLabel = function(category) {
    const labels = {
        'environnement': 'Environnement',
        'social': 'Social',
        'culture': 'Culture',
        'education': 'Éducation',
        'general': 'Général',
        'autre': 'Autre'
    };
    return labels[category] || 'Général';
};
