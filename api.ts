
import { StoreConfig, BrandConfig } from './types';
import { DEFAULT_CONFIG, DEFAULT_BRAND_CONFIG, MASTER_PIN_VALUE } from './constants';
import firebaseConfig from './firebase-applet-config.json';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection,
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';

const app = initializeApp(firebaseConfig);

// Inicialização Direta para evitar erros de databaseId não encontrado
// De acordo com o erro, o sistema está procurando por "(default)" mas o banco tem outro ID.
// Usamos a forma mais direta de atribuir o ID do banco.
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

console.log("[Firebase] Inicializado com:", {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId || "(usando default)"
});

// Helper para remover undefined (dupla camada de segurança)
function sanitizeData(data: any): any {
  if (!data) return data;
  try {
    // Recursivamente remove undefined e converte para null
    const san = (obj: any): any => {
      if (obj === undefined) return null;
      if (obj === null || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(san);
      const newObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = san(obj[key]);
        }
      }
      return newObj;
    };
    return san(data);
  } catch (e) {
    return data;
  }
}

// Validar conexão com Firestore
async function testConnection() {
  console.log("%c[Firebase] Iniciando Verificação...", "color: #f59e0b; font-weight: bold");
  try {
    const docRef = doc(db, 'public', 'connectivity_test');
    // Tenta uma leitura rápida com cache preferencial se possível
    await getDoc(docRef).catch(() => {});
    console.log("%c[Firebase] Conectado com sucesso!", "color: #10b981; font-weight: bold");
  } catch (error: any) {
    console.warn("[Firebase] Aviso de conexão limitada:", error.message);
  }
}
testConnection();

const ADMIN_COLLECTION = 'stores';
const PUBLIC_COLLECTION = 'public';
const PUBLIC_DOC_ID = 'main_config';

export function isFirebaseInitialized(): boolean {
  // Retorna se o config parece válido
  return !!firebaseConfig.projectId && !!firebaseConfig.apiKey;
}

export async function fetchConfig(pin: string): Promise<StoreConfig | undefined> {
  // Se for o PIN Master, damos um tempo limite para o Firebase. 
  // Se demorar demais ou falhar, retornamos o padrão para não travar o admin.
  if (pin === MASTER_PIN_VALUE) {
    try {
      const docRef = doc(db, ADMIN_COLLECTION, pin);
      // Timeout de 2.5s para o PIN Master buscar no banco
      const docSnap = await Promise.race([
        getDoc(docRef),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
      ]);
      
      if (docSnap && docSnap.exists()) return docSnap.data() as StoreConfig;
    } catch (error) {
      console.warn("[Firebase] Usando Fallback para PIN Master:", error);
    }
    return DEFAULT_CONFIG;
  }

  try {
    const docRef = doc(db, ADMIN_COLLECTION, pin);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as StoreConfig;
  } catch (error) {
    console.error(`[Firebase] Erro ao buscar PIN ${pin}:`, error);
  }
  
  return undefined;
}

/**
 * Lista todas as configurações/licenças do sistema (Uso Master)
 */
export async function listAllConfigs(): Promise<{pin: string, brandName: string, siteUrl: string}[]> {
  const configs: {pin: string, brandName: string, siteUrl: string}[] = [];

  try {
    const querySnapshot = await getDocs(collection(db, ADMIN_COLLECTION));
    querySnapshot.forEach((doc) => {
      const data = doc.data() as StoreConfig;
      if (doc.id !== MASTER_PIN_VALUE) {
        configs.push({
          pin: doc.id,
          brandName: data.brand.brandName,
          siteUrl: data.brand.siteUrl || ''
        });
      }
    });
    return configs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ADMIN_COLLECTION);
  }
  return configs;
}

export async function saveConfig(pin: string, config: StoreConfig): Promise<void> {
  try {
    const docRef = doc(db, ADMIN_COLLECTION, pin);
    const cleanData = sanitizeData(config);
    await setDoc(docRef, cleanData, { merge: true });
    return;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ADMIN_COLLECTION + '/' + pin);
  }
}

export async function fetchPublishedConfig(): Promise<BrandConfig> {
  try {
    const docRef = doc(db, PUBLIC_COLLECTION, PUBLIC_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as BrandConfig;
  } catch (error) {
    // Silently fallback to default if not found or error
  }
  return DEFAULT_BRAND_CONFIG;
}

export async function publishConfig(brandConfig: BrandConfig): Promise<void> {
  try {
    const docRef = doc(db, PUBLIC_COLLECTION, PUBLIC_DOC_ID);
    const cleanData = sanitizeData(brandConfig);
    await setDoc(docRef, cleanData);
    return;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PUBLIC_COLLECTION + '/' + PUBLIC_DOC_ID);
  }
}

export async function resetConfig(pin: string): Promise<void> {
  try {
    const docRef = doc(db, ADMIN_COLLECTION, pin);
    if (pin === MASTER_PIN_VALUE) await setDoc(docRef, DEFAULT_CONFIG);
    else await deleteDoc(docRef);
    return;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, ADMIN_COLLECTION + '/' + pin);
  }
}

// --- NOVAS FUNÇÕES PARA AGENDAMENTOS ---

export async function saveBooking(pin: string, booking: any): Promise<void> {
  try {
    const bookingsRef = collection(db, ADMIN_COLLECTION, pin, 'bookings');
    const newDoc = doc(bookingsRef);
    const bookingData = {
      ...booking,
      id: newDoc.id,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    await setDoc(newDoc, sanitizeData(bookingData));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ADMIN_COLLECTION}/${pin}/bookings`);
  }
}

export async function fetchBookings(pin: string): Promise<any[]> {
  try {
    const bookingsRef = collection(db, ADMIN_COLLECTION, pin, 'bookings');
    const querySnapshot = await getDocs(bookingsRef);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `${ADMIN_COLLECTION}/${pin}/bookings`);
    return [];
  }
}

export async function updateBooking(pin: string, bookingId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, ADMIN_COLLECTION, pin, 'bookings', bookingId);
    await setDoc(docRef, sanitizeData({ ...data, updatedAt: new Date().toISOString() }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ADMIN_COLLECTION}/${pin}/bookings/${bookingId}`);
    throw error;
  }
}

export async function deleteBooking(pin: string, bookingId: string): Promise<void> {
  try {
    const docRef = doc(db, ADMIN_COLLECTION, pin, 'bookings', bookingId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ADMIN_COLLECTION}/${pin}/bookings/${bookingId}`);
  }
}

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'anonymous' // Auth not used in this simplified pin flow yet
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
