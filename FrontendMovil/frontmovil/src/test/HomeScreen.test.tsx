import { render, screen } from '@testing-library/react-native';
import HomeMainActions from '../screens/Common/Home/HomeMainActions';

describe('HomeScreen', () => {
  it('renders main home actions', async () => {
    await render(<HomeMainActions styles={{}} onJoinRoute={jest.fn()} onOpenAlerts={jest.fn()} />);

    expect(await screen.findByText('Unirse a Ruta')).toBeTruthy();
    expect(await screen.findByText('Abrir Avisos')).toBeTruthy();
  });
});
