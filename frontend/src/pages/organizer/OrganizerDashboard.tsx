import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Event, People, Star, TrendingUp, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '@services/api';
import type { Event as EventType } from '../../types';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventType[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await apiService.getMyOrganizedEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const stats = [
    { title: 'Total Events', value: events.length, icon: Event, color: '#3b82f6' },
    { title: 'Total Volunteers', value: events.reduce((sum, e) => sum + e.registeredVolunteers, 0), icon: People, color: '#10b981' },
    { title: 'Avg Rating', value: (events.reduce((sum, e) => sum + (e.averageRating || 0), 0) / Math.max(events.length, 1)).toFixed(1), icon: Star, color: '#f59e0b' },
    { title: 'Open Events', value: events.filter(e => e.status === 'OPEN').length, icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Organizer Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Manage your events</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/events')}>Events</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/events/create')}>Create Event</Button>
        </Box>
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
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Your Events</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Volunteers</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map(e => (
                <TableRow key={e.id}>
                  <TableCell>{e.title}</TableCell>
                  <TableCell>{new Date(e.eventDate).toLocaleDateString()}</TableCell>
                  <TableCell>{e.location}</TableCell>
                  <TableCell>{e.registeredVolunteers}/{e.requiredVolunteers}</TableCell>
                  <TableCell><Chip label={e.status} size="small" color={e.status === 'OPEN' ? 'success' : 'default'} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default OrganizerDashboard;
