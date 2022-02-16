import { atom, useRecoilState, selector } from 'recoil';
import { logout, login, user_cache, MicrosoftAccount } from '../lib/commands';

interface Auth {
    error: Error | null;
    isLoading: boolean;
    authenicated: boolean;
    user: MicrosoftAccount | null
}

const currentUser = atom<Auth>({
    key: "account",
    default: {
        error: null,
        isLoading: false,
        authenicated: false,
        user: null
    }
});

const authenicatedAccount = selector<Auth>({
    key: "authenicatedAcccout",
    get: async ({ get }) => {
        try {
            const state = get(currentUser);
            const user = localStorage.getItem("active_user");
            if(user) {
                const cache = await user_cache();
                console.log(cache,user);
                return {
                    user: cache[user],
                    error: null,
                    isLoading: false,
                    authenicated: true,
                }
            }
            return state;
        } catch (error: any) {
            return {
                authenicated: false,
                isLoading: false,
                user: null,
                error: error
            };
        }
    },
    set: ({ set }, value) => {
        set(currentUser,value);
    }
});


export function useAuth(){
    const [auth,setAuth] = useRecoilState(authenicatedAccount);

    const window_login =  async () => {
       try {
            setAuth({...auth, isLoading: true });

            const user = await login();

            localStorage.setItem("active_user", user.xuid);
            
            setAuth({ isLoading: false, authenicated: true, user, error: null });
       } catch (error: any) {
            setAuth({ isLoading: false, error: error, user: null, authenicated: false  });
       }
    }
    const window_logout = async () => {
        try {
            setAuth({...auth, isLoading: true });
            localStorage.removeItem("active_user");
            await logout(auth.user?.xuid);
            setAuth({ isLoading: false, authenicated: false, user: null, error: null });
        } catch (error: any) {
            setAuth({ ...auth, isLoading: false, error: error });
        }
    }

    return {
        ...auth,
        login: window_login,
        logout: window_logout
    }
}