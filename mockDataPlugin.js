const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultUsers = [
  {
    id: 1,
    name: 'John Doe',
    type: 'Admin',
    email: 'john.doe@example.com',
    phone: '+1234567890',
  },
  {
    id: 2,
    name: 'Not Found',
    type: 'User',
    email: 'jane.smith@example.com',
    phone: '+1987654321',
  },
  {
    id: 3,
    name: 'Not Found Html',
    type: 'Agent',
    email: 'bob.brown@example.com',
    phone: '+1123456789',
  },
  {
    id: 4,
    name: 'Unauthorized',
    type: 'User',
    email: 'alice.johnson@example.com',
    phone: '+15551234567',
  },
  {
    id: 5,
    name: 'Server Error',
    type: 'Admin',
    email: 'charlie.davis@example.com',
    phone: '+14445556666',
  },
  {
    id: 6,
    name: 'Diana Prince',
    type: 'Agent',
    email: 'diana.prince@example.com',
    phone: '+13334445555',
  },
  {
    id: 7,
    name: 'Ethan Hunt',
    type: 'User',
    email: 'ethan.hunt@example.com',
    phone: '+12223334444',
  },
  {
    id: 8,
    name: 'Felicity',
    type: 'Admin',
    email: 'felicity@example.com',
    phone: '+19998887777',
  },
  {
    id: 9,
    name: 'George Clooney',
    type: 'User',
    email: 'george.clooney@example.com',
    phone: '+18887776666',
  },
  {
    id: 10,
    name: 'Montana',
    type: 'Agent',
    email: 'montana@example.com',
    phone: '+17775554444',
  },
];

const usersRoles = {
  1: ['Create', 'Update', 'Delete', 'Read'],
  2: ['Read'],
  3: ['Create', 'Read'],
  4: ['Update', 'Read'],
  5: ['Create', 'Update'],
  6: ['Delete', 'Read'],
  7: ['Create', 'Read'],
  8: ['Update', 'Read'],
  9: ['Delete', 'Read'],
  10: ['Create', 'Update', 'Read'],
};

let users = [...defaultUsers];
users = [...defaultUsers];

const toListItem = (item) => ({
  id: item.id,
  name: item.name,
  type: item.type,
});

const messages = {
  userNotFound: JSON.stringify({
    message: 'User not found',
  }),
  userNotFoundHtml: '<h1>User not found</h1>',
  unauthorized: JSON.stringify({
    message: 'Unauthorized',
  }),
  unableAccess: JSON.stringify({
    message: 'Unable to access the database',
  }),
};

const configureServer = (server) => {
  server.middlewares.use('/api/user/list', async (req, res) => {
    await sleep(1000);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(users.map(toListItem)));
  });
  server.middlewares.use('/api/user', async (req, res, next) => {
    const path = req.originalUrl.replace(/\/api\/user\/?/, '');
    const userId = Number.parseInt(path, 10);
    const getType = () => {
      if (path === '') {
        return req.method === 'POST' ? 'create' : 'next';
      }
      if (path.replace(userId, '') === '') {
        if (req.method === 'DELETE') {
          return 'delete';
        }
        return req.method === 'GET' ? 'get' : 'next';
      }
      if (path.replace(`${userId}/roles`, '') === '') {
        return req.method === 'GET' ? 'getRoles' : 'next';
      }
    };
    const type = getType();
    if (type === 'next') {
      return next();
    }

    await sleep(1000);
    res.setHeader('Content-Type', 'application/json');
    if (type === 'getRoles') {
      const roles = usersRoles[userId];
      if (!roles) {
        res.statusCode = 404;
        res.end(messages.userNotFound);
        return;
      }
      res.end(JSON.stringify(roles));
      return;
    }
    if (type === 'get') {
      const user = users.find((x) => x.id === userId);
      if (!user || user.id === 2) {
        res.statusCode = 404;
        res.end(messages.userNotFound);
        return;
      }
      if (user.id === 3) {
        res.statusCode = 404;
        res.end(messages.userNotFoundHtml);
        return;
      }
      if (user.id === 4) {
        res.statusCode = 401;
        res.end(messages.unauthorized);
        return;
      }
      if (user.id === 5) {
        res.statusCode = 500;
        res.end(messages.unableAccess);
        return;
      }
      if (!user) {
        res.statusCode = 404;
        res.end(messages.userNotFound);
        return;
      }
      res.end(JSON.stringify(user));
      return;
    }
    if (type === 'create') {
      const user = defaultUsers.find((x) => !users.some((y) => y.id === x.id));
      users = [...users, user];
      res.end(JSON.stringify(user));
      return;
    }
    if (type === 'delete') {
      const user = users.find((x) => x.id === userId);
      if (!user || user.id === 2) {
        res.statusCode = 404;
        res.end(messages.userNotFound);
        return;
      }
      if (user.id === 3) {
        res.statusCode = 404;
        res.end('<h1>Not Found</h1>');
        return;
      }
      if (user.id === 4) {
        res.statusCode = 401;
        res.end(messages.unauthorized);
        return;
      }
      if (user.id === 5) {
        res.statusCode = 500;
        res.end(messages.unableAccess);
        return;
      }
      users = users.filter((x) => x !== user);
      res.end(JSON.stringify({}));
      return;
    }
  });
};
export const mockDataPlugin = () => ({
  name: 'mock-data-plugin',
  configureServer: configureServer,
});
