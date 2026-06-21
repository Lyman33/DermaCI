/**
 * Wrapper pour les appels API avec retry automatique
 * Gère les timeouts et erreurs réseau transparemment
 */

export async function invokeWithRetry(functionName, payload, maxRetries = 3) {
  const { base44 } = await import('@/api/base44Client');
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Timeout par défaut 45s pour chaque tentative
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 45000)
      );
      
      const requestPromise = base44.functions.invoke(functionName, payload);
      const response = await Promise.race([requestPromise, timeoutPromise]);
      
      return response;
    } catch (error) {
      lastError = error;
      
      // Ne pas retry si c'est une erreur de validation
      if (error.message?.includes('Données manquantes') || error.message?.includes('validation')) {
        throw error;
      }
      
      // Log la tentative
      console.warn(`[API] ${functionName} attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // Attendre avant retry (délai croissant)
      if (attempt < maxRetries) {
        const delayMs = 1000 * attempt;
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  
  throw new Error(
    lastError?.message || 
    `${functionName} failed after ${maxRetries} attempts. Please check your connection and try again.`
  );
}

export async function integrationWithRetry(integrationPath, maxRetries = 2) {
  const { base44 } = await import('@/api/base44Client');
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout')), 60000)
      );
      
      // Dynamically get the integration
      const parts = integrationPath.split('.');
      let integration = base44.integrations;
      for (const part of parts) {
        integration = integration[part];
      }
      
      const requestPromise = integration();
      const response = await Promise.race([requestPromise, timeoutPromise]);
      
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`[Integration] attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delayMs = 1000 * attempt;
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  
  throw lastError || new Error('Integration request failed after retries');
}