import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Slider, Grid } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeMute, ArrowBack, Fullscreen, Forward10, Replay10 } from '@mui/icons-material';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { API_ENDPOINTS } from '../api/config';
import styled from 'styled-components';

const PlayerContainer = styled(Box)`
  background-color: #000;
  height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const VideoWrapper = styled(Box)`
  flex-grow: 1;
  position: relative;
`;

const ControlsOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    transparent 20%,
    transparent 80%,
    rgba(0, 0, 0, 0.7) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  transition: opacity 0.3s;
  opacity: ${({ $visible }) => ($visible ? '1' : '0')};
`;

const ControlBar = styled(Box)`
  padding: 20px;
  color: white;
`;

const PlayerPage = () => {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get('episode');
  const [content, setContent] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const playerRef = useRef(null);
  const navigate = useNavigate();
  const controlsTimeout = useRef(null);

  const handleForward = () => {
    const player = playerRef.current;
    if (player) {
      const newTime = Math.min(player.getCurrentTime() + 10, duration);
      player.seekTo(newTime);
    }
  };

  const handleRewind = () => {
    const player = playerRef.current;
    if (player) {
      const newTime = Math.max(player.getCurrentTime() - 10, 0);
      player.seekTo(newTime);
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.CONTENT}${contentId}/`);
        setContent(response.data);

        if (episodeId && response.data.episodes) {
          const ep = response.data.episodes.find(e => e.id === parseInt(episodeId));
          setEpisode(ep);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();

    // Ocultar los controles después de un tiempo
    resetControlsTimeout();

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [contentId, episodeId]);

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setControlsVisible(true);
    controlsTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue / 100);
    setMuted(newValue === 0);
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleProgress = (state) => {
    setPlayed(state.played);

    // Actualizar progreso en el servidor cada 10 segundos
    if (Math.floor(state.playedSeconds) % 10 === 0) {
      updateProgress(state.playedSeconds);
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleSeek = (event, newValue) => {
    setPlayed(newValue / 100);
    playerRef.current.seekTo(newValue / 100);
  };

  const updateProgress = async (watchedTime) => {
    try {
      await axios.post(API_ENDPOINTS.UPDATE_PROGRESS, {
        content: episodeId ? null : contentId,
        episode: episodeId || null,
        watched_time: watchedTime,
        total_duration: duration
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error al intentar mostrar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const videoUrl = episode ? episode.video_file : content?.video_file;

  return (
    <PlayerContainer onMouseMove={handleMouseMove}>
      <VideoWrapper>
        {videoUrl && (
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            playing={playing}
            volume={volume}
            muted={muted}
            onProgress={handleProgress}
            onDuration={handleDuration}
            style={{ backgroundColor: 'black' }}
          />
        )}
        <Box p={2} sx={{ position: 'absolute', top: 50, left: 0, zIndex: 2 }}>
          <IconButton
            onClick={handleBack}
            sx={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
              transition: 'background-color 0.3s ease',
              color: 'white'  // Esto aplicará color blanco al ícono
            }}
          >
            <ArrowBack fontSize="large" />
          </IconButton>
        </Box>
        <ControlsOverlay $visible={controlsVisible}>
          <Box p={2}>
            {/* Vacío o con otros controles superiores si necesitas */}
          </Box>
          <ControlBar>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <IconButton color="inherit" onClick={handlePlayPause}>
                  {playing ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton color="inherit" onClick={handleRewind}>
                  <Replay10 fontSize="medium" />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton color="inherit" onClick={handleForward}>
                  <Forward10 fontSize="medium" />
                </IconButton>
              </Grid>

              <Grid item xs={16}>
                <Slider
                  value={played * 100}
                  onChange={handleSeek}
                  aria-labelledby="continuous-slider"
                  sx={{ color: '#e50914', minWidth: '300px' }}
                />
              </Grid>

              <Grid item>
                <Typography variant="body2">
                  {formatTime(duration * played)} / {formatTime(duration)}
                </Typography>
              </Grid>

              <Grid item>
                <IconButton color="inherit" onClick={handleMute}>
                  {muted ? <VolumeMute /> : <VolumeUp />}
                </IconButton>
              </Grid>

              <Grid item xs={4}>
                <Slider
                  value={muted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  aria-labelledby="volume-slider"
                  sx={{ color: 'white', minWidth: '80px' }}
                />
              </Grid>

              <Grid item>
                <IconButton color="inherit" onClick={handleFullscreen}>
                  <Fullscreen />
                </IconButton>
              </Grid>
            </Grid>
          </ControlBar>
        </ControlsOverlay>
      </VideoWrapper>
    </PlayerContainer>
  );
};

export default PlayerPage;