// =====================================================
// CONFIGURATION SUPABASE CENTRALISÉE
// =====================================================

const SUPABASE_URL = 'https://gkvtwxnddpgoyrpedhua.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdnR3eG5kZHBnb3lycGVkaHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5ODA0MzAsImV4cCI6MjA4NzU1NjQzMH0.iTSfiOGCFky2fk6JXubFRBK8A0sVGfqMqALzD0og1KM';

// Créer le client Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exposer globalement
window.supabase = supabaseClient;
window.supabaseClient = supabaseClient;

console.log('✅ Supabase initialisé avec succès');

// =====================================================
// FONCTIONS UTILITAIRES GLOBALES
// =====================================================

window.logout = async function() {
    try {
        await supabaseClient.auth.signOut();
        localStorage.removeItem('user_display');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        window.location.href = 'index.html';
    }
};

window.getCurrentUser = async function() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error || !session) {
            return { user: null, session: null };
        }
        
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        if (userError) {
            return { user: null, session };
        }
        
        return { user: userData, session };
    } catch (error) {
        console.error('Erreur getCurrentUser:', error);
        return { user: null, session: null };
    }
};

window.showToast = function(message, type = 'info', duration = 3000) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
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
    }
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.textContent = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, duration);
};

window.formatDate = function(dateString, options = {}) {
    const defaultOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
};

window.truncateText = function(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

window.getCategoryLabel = function(category) {
    const labels = {
        'environnement': 'Environnement',
        'social': 'Social',
        'culture': 'Culture',
        'education': 'Éducation',
        'general': 'Général'
    };
    return labels[category] || 'Général';
};
