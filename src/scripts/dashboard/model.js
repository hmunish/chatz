import axios from 'axios';
import { sanitizeUserInput } from '../common/utility';
import { BACKEND_HOST_URL } from '../common/config';

export const state = {
  user: {},
};

export async function isSignedIn() {
  try {
    const authKey = localStorage.getItem('chatzSignIn');
    if (!authKey) return false;
    const response = await axios.get(`${BACKEND_HOST_URL}/users/isSignedIn`, {
      headers: { authKey: JSON.parse(localStorage.getItem('chatzSignIn')) },
    });
    if (response.status === 200) {
      return true;
    } return false;
  } catch (err) {
    return false;
  }
}
