import { render } from '@testing-library/react-native';
import HomeMainActions from '../screens/Common/Home/HomeMainActions';

describe('HomeScreen', () => {
  it('renders main home actions', async () => {
    const { getByText } = await render(<HomeMainActions styles={{}} onJoinRoute={jest.fn()} onOpenAlerts={jest.fn()} />);

    expect(getByText('Unirse a Ruta')).toBeTruthy();
    expect(getByText('Abrir Avisos')).toBeTruthy();
  });
});
