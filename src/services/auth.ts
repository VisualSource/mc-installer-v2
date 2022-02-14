import { atom, useRecoilState } from 'recoil';
import { logout, login, user_cache, MicrosoftAccount } from '../lib/commands';

interface Auth {
    error: Error | null;
    isLoading: boolean;
    authenicated: boolean;
    user: MicrosoftAccount | null
}

const user_auth = atom<Auth>({
    key: "account",
    default: {
        error: null,
        isLoading: false,
        authenicated: false,
        user: null
    }
});

export function useAuth(){
    const [auth,setAuth] = useRecoilState(user_auth);

    const window_login =  async () => {
       try {
            setAuth({...auth, isLoading: true });

            const cache = await user_cache();
            const users = Object.values(cache);

            let user;
            if(users.length === 1) {
                user = users[0];
            } else {
                user = await login();
            }

            setAuth({ isLoading: false, authenicated: true, user, error: null });
       } catch (error: any) {
            setAuth({ isLoading: false, error: error, user: null, authenicated: false  });
       }
    }
    const window_logout = async () => {
        try {
            setAuth({...auth, isLoading: true });
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