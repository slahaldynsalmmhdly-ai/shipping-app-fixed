// دالة مساعدة لإعادة المحاولة عند فشل الطلب
export async function fetchWithRetry(
    url: string, 
    options: RequestInit, 
    retries: number = 3,
    delay: number = 2000
): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            
            // إذا نجح الطلب، أرجع الاستجابة
            if (response.ok) {
                return response;
            }
            
            // إذا كان الخطأ 401 أو 403، لا تعيد المحاولة
            if (response.status === 401 || response.status === 403) {
                return response;
            }
            
            // إذا كان الخطأ 404، لا تعيد المحاولة
            if (response.status === 404) {
                return response;
            }
            
            // في حالة الأخطاء الأخرى، أعد المحاولة
            if (i < retries - 1) {
                console.log(`إعادة المحاولة ${i + 1}/${retries}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                return response;
            }
        } catch (error) {
            // خطأ في الشبكة
            if (i < retries - 1) {
                console.log(`خطأ في الشبكة، إعادة المحاولة ${i + 1}/${retries}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    
    throw new Error('فشل الطلب بعد عدة محاولات');
}
