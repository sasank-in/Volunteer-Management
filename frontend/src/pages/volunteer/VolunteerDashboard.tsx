import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tab, Tabs } from '@mui/material';
import { Event, CheckCircle, Star, TrendingUp } from '@mui/icons-material';
import apiService from '@services/api';
import type { Participation, Event as EventType } from '../../types';
import { useNavigate } from 'react-router-dom';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [participationsData, eventsData] = await Promise.all([
        apiService.getMyParticipations(),
        apiService.getAllEvents(),
      ]);
      setParticipations(participationsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      await apiService.registerForEvent(eventId);
      loadData();
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  const stats = [
    { title: 'Events Registered', value: participations.length, icon: Event, color: '#3b82f6' },
    { title: 'Events Attended', value: participations.filter(p => p.status === 'ATTENDED').length, icon: CheckCircle, color: '#10b981' },
    { title: 'Upcoming Events', value: events.filter(e => e.status === 'OPEN').length, icon: TrendingUp, color: '#f59e0b' },
    { title: 'Avg Rating', value: '4.5', icon: Star, color: '#8b5cf6' },
  ];

  const eventsById = new Map(events.map((event) => [event.id, event]));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Volunteer Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Track your volunteer activities</Typography>
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
          <Tab label="My Participations" />
          <Tab label="Available Events" />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participations.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{eventsById.get(p.eventId)?.title || 'Event'}</TableCell>
                    <TableCell>{new Date(p.registeredAt).toLocaleDateString()}</TableCell>
                    <TableCell><Chip label={p.status} size="small" color={p.status === 'ATTENDED' ? 'success' : 'default'} /></TableCell>
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
                  <TableCell>Date</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>{new Date(e.eventDate).toLocaleDateString()}</TableCell>
                    <TableCell>{e.location}</TableCell>
                    <TableCell>{e.organizerName}</TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" onClick={() => handleRegister(e.id)}>Register</Button>
                    </TableCell>
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

export default VolunteerDashboard;
