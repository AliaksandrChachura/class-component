import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterDetails from '../CharacterDetails';
import type { Character } from '../../api/rickMortyAPI';

// Mock React Router hooks
const mockNavigate = vi.fn();
const mockUseLoaderData = vi.fn();

vi.mock('react-router-dom', () => ({
  useLoaderData: () => mockUseLoaderData(),
  useNavigate: () => mockNavigate,
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

describe('CharacterDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLoaderData.mockReturnValue({ character: mockCharacter });
  });

  it('renders character details correctly', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Character Details')).toBeInTheDocument();
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Alive - Human')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Earth (C-137)')).toBeInTheDocument();
    expect(screen.getByText('Citadel of Ricks')).toBeInTheDocument();
  });

  it('displays character image with correct attributes', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    const image = screen.getByAltText('Rick Sanchez');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      'src',
      'https://rickandmortyapi.com/api/character/avatar/1.jpeg'
    );
  });

  it('navigates back to results when close button is clicked', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    const closeButton = screen.getByLabelText('Close details panel');
    fireEvent.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/results');
  });

  it('displays correct status color for alive character', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Alive - Human')).toBeInTheDocument();

    const statusDot = document.querySelector('.status-dot');
    expect(statusDot).toHaveStyle('background-color: #55cc44');
  });

  it('displays correct status color for dead character', () => {
    const deadCharacter = {
      ...mockCharacter,
      status: 'Dead',
    };
    mockUseLoaderData.mockReturnValue({ character: deadCharacter });

    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Dead - Human')).toBeInTheDocument();

    const statusDot = document.querySelector('.status-dot');
    expect(statusDot).toHaveStyle('background-color: #d63d2e');
  });

  it('displays correct status color for unknown status', () => {
    const unknownCharacter = {
      ...mockCharacter,
      status: 'unknown',
    };
    mockUseLoaderData.mockReturnValue({ character: unknownCharacter });

    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('unknown - Human')).toBeInTheDocument();

    const statusDot = document.querySelector('.status-dot');
    expect(statusDot).toHaveStyle('background-color: #9e9e9e');
  });

  it('formats creation date correctly', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('November 4, 2017')).toBeInTheDocument();
  });

  it('displays episode count correctly', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

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
    mockUseLoaderData.mockReturnValue({ character: characterWithType });

    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Scientist')).toBeInTheDocument();
  });

  it('does not display type field when empty', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.queryByText('Type:')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    const closeButton = screen.getByLabelText('Close details panel');
    expect(closeButton).toHaveAttribute('aria-label', 'Close details panel');
  });

  it('has correct CSS classes for styling', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

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
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Location Information')).toBeInTheDocument();
    expect(screen.getByText('Episodes')).toBeInTheDocument();
  });

  it('displays gender information', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Gender:')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('displays origin and location information', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Origin:')).toBeInTheDocument();
    expect(screen.getByText('Last Known Location:')).toBeInTheDocument();
  });

  it('displays created date label', () => {
    render(<CharacterDetails isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Created:')).toBeInTheDocument();
  });
});
