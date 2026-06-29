import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../api/services';
import LoginScreen from '../screens/Auth/LoginScreen';

jest.mock('../api/services', () => ({
  AuthService: {
    login: jest.fn(),
  },
}));
jest.mock('jwt-decode', () => ({ __esModule: true, default: jest.fn(() => ({ user_id: 'user-id', user_role: 'admin' })) }));

describe('LoginScreen', () => {
  it('logs in and navigates home', async () => {
    const navigate = jest.fn();
    (AuthService.login as jest.Mock).mockResolvedValue('jwt-token');

    const { getByPlaceholderText, getByText } = await render(<LoginScreen navigation={{ navigate } as any} />);

    fireEvent.changeText(getByPlaceholderText('Correo electrónico'), 'admin@example.com');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'Admin12345');
    await fireEvent.press(getByText('Ingresar'));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('Home'));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', 'jwt-token');
  });
});
