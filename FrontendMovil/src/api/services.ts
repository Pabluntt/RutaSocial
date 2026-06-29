import { apiClient, responseMessage } from './client';

export type PublicUserInfo = {
  _id?: string;
  id?: string;
  name?: string;
  institutionID?: string;
  phone?: string;
};

export const AuthService = {
  async login(email: string, password: string): Promise<string> {
    const { data } = await apiClient.post('/login', { email, password });
    return data?.token;
  },
};

export const UserService = {
  async profile() {
    const { data } = await apiClient.get('/user/profile');
    return responseMessage<any>(data, {});
  },

  async all() {
    const { data } = await apiClient.get('/user');
    return responseMessage<any[]>(data, []);
  },

  async createByAdmin(user: {
    name: string;
    email: string;
    password: string;
    phone: string;
    institutionID: string;
    role: string;
  }) {
    const { data } = await apiClient.post('/user', user);
    return responseMessage<any>(data, {});
  },

  async updateProfile(data: Record<string, unknown>) {
    const response = await apiClient.put('/user/update', data);
    return responseMessage<any>(response.data, {});
  },

  async participation(userId: string) {
    const { data } = await apiClient.get(`/route/participation/${userId}`);
    return responseMessage<{ total_helpingpoints: number; total_routes: number }>(data, {
      total_helpingpoints: 0,
      total_routes: 0,
    });
  },

  async batch(ids: string[]): Promise<PublicUserInfo[]> {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (uniqueIds.length === 0) return [];
    try {
      const { data } = await apiClient.get('/user/batch', { params: { ids: uniqueIds.join(',') } });
      return responseMessage<PublicUserInfo[]>(data, []);
    } catch {
      const users = await Promise.all(uniqueIds.map(async (id): Promise<PublicUserInfo | undefined> => {
        try {
          const { data } = await apiClient.get(`/user/public-info/${id}`);
          return { id, ...responseMessage<PublicUserInfo>(data, {}) };
        } catch {
          return undefined;
        }
      }));
      return users.filter((user): user is PublicUserInfo => Boolean(user));
    }
  },
};

export const InstitutionService = {
  async all() {
    const { data } = await apiClient.get('/institution/');
    return responseMessage<any[]>(data, []);
  },
};

export const CalendarService = {
  async all() {
    const { data } = await apiClient.get('/calendar-event');
    return responseMessage<any[]>(data, []);
  },

  async byDate(date: string) {
    const { data } = await apiClient.get('/calendar-event', { params: { date } });
    return responseMessage<any[]>(data, []);
  },

  async create(event: Record<string, unknown>) {
    const { data } = await apiClient.post('/calendar-event', event);
    return responseMessage<any>(data, {});
  },
};

export const NoticeService = {
  async all() {
    const { data } = await apiClient.get('/notification');
    return responseMessage<any[]>(data, []);
  },

  async unread() {
    const { data } = await apiClient.get('/notification/unread');
    return responseMessage<any[]>(data, []);
  },

  async markRead(id: string) {
    await apiClient.put(`/notification/read/${id}`, {});
  },

  async create(body: Record<string, unknown>) {
    const { data } = await apiClient.post('/notification', body);
    return responseMessage<any>(data, {});
  },
};

export const RouteService = {
  async all() {
    const { data } = await apiClient.get('/route');
    return responseMessage<any[]>(data, []);
  },

  async create(route: Record<string, unknown>) {
    const { data } = await apiClient.post('/route', route);
    return responseMessage<any>(data, {});
  },

  async byCode(code: string) {
    const { data } = await apiClient.get(`/route/code/${code}`);
    return responseMessage<any>(data, null);
  },

  async remove(id: string) {
    await apiClient.delete(`/route/${id}`);
  },

  async finish(id: string) {
    const { data } = await apiClient.patch(`/route/${id}`, {});
    return responseMessage<any>(data, {});
  },
};

export const HelpPointService = {
  async all() {
    const { data } = await apiClient.get('/helping-point');
    return responseMessage<any[]>(data, []);
  },

  async create(helpPoint: Record<string, unknown>) {
    const { data } = await apiClient.post('/helping-point', helpPoint);
    return responseMessage<any>(data, {});
  },

  async remove(id: string) {
    await apiClient.delete(`/helping-point/${id}`);
  },
};

export const RiskService = {
  async all() {
    const { data } = await apiClient.get('/risk');
    return responseMessage<any[]>(data, []);
  },

  async create(risk: Record<string, unknown>) {
    const { data } = await apiClient.post('/risk', risk);
    return responseMessage<any>(data, {});
  },

  async remove(id: string) {
    await apiClient.delete(`/risk/${id}`);
  },
};

export const AlojamientoService = {
  async all() {
    const { data } = await apiClient.get('/alojamiento');
    return responseMessage<any[]>(data, []);
  },
};
