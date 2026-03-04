import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tab, Tabs } from '@mui/material';
import { People, Event, CheckCircle, TrendingUp } from '@mui/icons-material';
import apiService from '@services/api';
import type { UserAccount, Event as EventType } from '../../types';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, eventsData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllEvents(),
      ]);
      setUsers(usersData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const stats = [
    { title: 'Total Users', value: users.length, icon: People, color: '#3b82f6' },
    { title: 'Total Events', value: events.length, icon: Event, color: '#10b981' },
    { title: 'Organizers', value: users.filter(u => u.role === 'ORGANIZER').length, icon: CheckCircle, color: '#f59e0b' },
    { title: 'Volunteers', value: users.filter(u => u.role === 'VOLUNTEER').length, icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Manage users and events</Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/events')}>Events</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: stat.color, color: 'white', mr: 2 }}>
                      <Icon />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Paper>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Users" />
          <Tab label="Events" />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip label={u.role} size="small" /></TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>{e.organizerName}</TableCell>
                    <TableCell>{new Date(e.eventDate).toLocaleDateString()}</TableCell>
                    <TableCell><Chip label={e.status} size="small" color={e.status === 'OPEN' ? 'success' : 'default'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
