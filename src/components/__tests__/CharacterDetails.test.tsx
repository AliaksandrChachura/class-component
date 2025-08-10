import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { render } from './testUtils';
import CharacterDetails from '../CharacterDetails';
import type { Character } from '../../api/types';
import * as characterApi from '../../api/endpoints/characterApi';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../../api/endpoints/characterApi', () => ({
  useGetCharacterQuery: vi.fn(),
}));

const mockCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: {
    name: 'Earth (C-137)',
    url: 'https://rickandmortyapi.com/api/location/1',
  },
  location: {
    name: 'Citadel of Ricks',
    url: 'https://rickandmortyapi.com/api/location/3',
  },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: [
    'https://rickandmortyapi.com/api/episode/1',
    'https://rickandmortyapi.com/api/episode/2',
  ],
  url: 'https://rickandmortyapi.com/api/character/1',
  created: '2017-11-04T18:48:46.250Z',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>, {});
};

describe('CharacterDetails Component', () => {
  let mockUseGetCharacterQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Get the mocked function
    mockUseGetCharacterQuery = vi.mocked(characterApi.useGetCharacterQuery);

    mockUseGetCharacterQuery.mockReturnValue({
      data: mockCharacter,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: mockCharacter,
      endpointName: 'getCharacter',
      originalArgs: { id: 1 },
      requestId: 'test-request-id',
      status: 'fulfilled',
      isSuccess: true,
      isError: false,
      isUninitialized: false,
    });
  });

  it('renders character details correctly', () => {
    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Character Details')).toBeInTheDocument();
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Alive - Human')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Earth (C-137)')).toBeInTheDocument();
    expect(screen.getByText('Citadel of Ricks')).toBeInTheDocument();
  });

  it('displays character image with correct attributes', () => {
    renderWithRouter(<CharacterDetails />);

    const image = screen.getByAltText('Rick Sanchez');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      'src',
      'https://rickandmortyapi.com/api/character/avatar/1.jpeg'
    );
  });

  it('navigates back to results when close button is clicked', () => {
    renderWithRouter(<CharacterDetails />);

    const closeButton = screen.getByLabelText('Close details panel');
    fireEvent.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/results');
  });

  it('displays correct status color for alive character', () => {
    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Alive - Human')).toBeInTheDocument();

    const statusDot = document.querySelector('.status-dot');
    expect(statusDot).toHaveStyle('background-color: #55cc44');
  });

  it('displays correct status color for dead character', () => {
    const deadCharacter = {
      ...mockCharacter,
      status: 'Dead',
    };
    mockUseGetCharacterQuery.mockReturnValue({
      data: deadCharacter,
      isLoading: false,
      error: null,
    });

    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Dead - Human')).toBeInTheDocument();

    const statusDot = document.querySelector('.status-dot');
    expect(statusDot).toHaveStyle('background-color: #d63d2e');
  });

  it('displays correct status color for unknown status', () => {
    const unknownCharacter = {
      ...mockCharacter,
      status: 'unknown',
    };
    mockUseGetCharacterQuery.mockReturnValue({
      data: unknownCharacter,
      isLoading: false,
      error: null,
    });

    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('unknown - Human')).toBeInTheDocument();

    const statusDot = document.querySelector('.status-dot');
    expect(statusDot).toHaveStyle('background-color: #9e9e9e');
  });

  it('formats creation date correctly', () => {
    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('November 4, 2017')).toBeInTheDocument();
  });

  it('displays episode count correctly', () => {
    renderWithRouter(<CharacterDetails />);

    expect(
      screen.getByText(
        (content) =>
          content.includes('Appeared in') && content.includes('episodes')
      )
    ).toBeInTheDocument();
  });

  it('handles character with type field', () => {
    const characterWithType = {
      ...mockCharacter,
      type: 'Scientist',
    };
    mockUseGetCharacterQuery.mockReturnValue({
      data: characterWithType,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: characterWithType,
      endpointName: 'getCharacter',
      originalArgs: { id: 1 },
      requestId: 'test-request-id',
      status: 'fulfilled',
      isSuccess: true,
      isError: false,
      isUninitialized: false,
    });

    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Scientist')).toBeInTheDocument();
  });

  it('does not display type field when empty', () => {
    renderWithRouter(<CharacterDetails />);

    expect(screen.queryByText('Type:')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    renderWithRouter(<CharacterDetails />);

    const closeButton = screen.getByLabelText('Close details panel');
    expect(closeButton).toHaveAttribute('aria-label', 'Close details panel');
  });

  it('has correct CSS classes for styling', () => {
    renderWithRouter(<CharacterDetails />);

    expect(
      document.querySelector('.character-details-container')
    ).toBeInTheDocument();
    expect(
      document.querySelector('.character-details-panel')
    ).toBeInTheDocument();
    expect(
      document.querySelector('.character-details-header')
    ).toBeInTheDocument();
    expect(
      document.querySelector('.character-details-content')
    ).toBeInTheDocument();
  });

  it('displays all required character information sections', () => {
    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Location Information')).toBeInTheDocument();
    expect(screen.getByText('Episodes')).toBeInTheDocument();
  });

  it('displays gender information', () => {
    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Gender:')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('displays origin and location information', () => {
    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Origin:')).toBeInTheDocument();
    expect(screen.getByText('Last Known Location:')).toBeInTheDocument();
  });

  it('displays created date label', () => {
    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Created:')).toBeInTheDocument();
  });

  it('shows loading state when fetching character data', () => {
    mockUseGetCharacterQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: undefined,
      endpointName: 'getCharacter',
      originalArgs: { id: 1 },
      requestId: 'test-request-id',
      status: 'pending',
      isSuccess: false,
      isError: false,
      isUninitialized: false,
    });

    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Character Details')).toBeInTheDocument();
    expect(
      screen.getByText('Loading character details...')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Close details panel' })
    ).toBeInTheDocument();
  });

  it('shows error state when API call fails', () => {
    mockUseGetCharacterQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: 'API Error' },
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: undefined,
      endpointName: 'getCharacter',
      originalArgs: { id: 1 },
      requestId: 'test-request-id',
      status: 'rejected',
      isSuccess: false,
      isError: true,
      isUninitialized: false,
    });

    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Character Details')).toBeInTheDocument();
    expect(
      screen.getByText('Error loading character details. Please try again.')
    ).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('shows no character found state when character data is null', () => {
    mockUseGetCharacterQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: null,
      endpointName: 'getCharacter',
      originalArgs: { id: 1 },
      requestId: 'test-request-id',
      status: 'fulfilled',
      isSuccess: true,
      isError: false,
      isUninitialized: false,
    });

    renderWithRouter(<CharacterDetails />);

    expect(screen.getByText('Character Details')).toBeInTheDocument();
    expect(screen.getByText('Character not found.')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('navigates back when close button is clicked in error state', () => {
    mockUseGetCharacterQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: 'API Error' },
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: undefined,
      endpointName: 'getCharacter',
      originalArgs: { id: 1 },
      requestId: 'test-request-id',
      status: 'rejected',
      isSuccess: false,
      isError: true,
      isUninitialized: false,
    });

    renderWithRouter(<CharacterDetails />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/results');
  });

  it('navigates back when close button is clicked in no character state', () => {
    mockUseGetCharacterQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: null,
      endpointName: 'getCharacter',
      originalArgs: { id: 1 },
      requestId: 'test-request-id',
      status: 'fulfilled',
      isSuccess: true,
      isError: false,
      isUninitialized: false,
    });

    renderWithRouter(<CharacterDetails />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/results');
  });
});
