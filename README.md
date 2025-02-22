# Math Practice App

An interactive web application designed to help children practice multiplication tables. The app adapts to each child's learning pace and provides detailed progress tracking for parents.

## Features

### Exercise Mode
- Interactive multiplication practice
- Customizable problem sets
- Immediate visual feedback
- Progress tracking during exercises
- Adaptive problem selection based on:
  - Factor difficulty
  - Past performance
  - Problem frequency
- Pause/resume functionality
- Retry mode for incorrect answers

### Review Mode
- Detailed performance statistics
- Individual progress tracking
- Historical exercise review
- Performance trends visualization
- Multiplication table proficiency overview

## Technical Stack

- Frontend: React with TypeScript
- Styling: Tailwind CSS
- Build Tool: Vite
- Testing: Vitest and React Testing Library
- Containerization: Docker
- Deployment: Raspberry Pi (local network)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd math-practice-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
math-practice-app/
├── src/
│   ├── components/
│   │   ├── Exercise/
│   │   ├── NumericKeyboard/
│   │   ├── ProblemDisplay/
│   │   └── ProgressIndicator/
│   ├── context/
│   │   └── ExerciseContext/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── test/
├── public/
└── ...config files
```

## Component Overview

### ProblemDisplay
Displays the current multiplication problem with clear, child-friendly typography.

### NumericKeyboard
Custom on-screen keyboard for answer input, optimized for touch devices.

### ProgressIndicator
Visual feedback showing exercise progress and correct/incorrect answers.

### Exercise
Main component combining all elements into a cohesive practice experience.

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Docker Deployment
```bash
# Build the Docker image
docker build -t math-practice-app .

# Run the container
docker run -p 3000:3000 math-practice-app
```

## Usage

1. Select a user from the home screen
2. Choose Exercise or Review mode
3. For Exercise mode:
   - Select number of problems
   - Complete the exercise set
   - Review results
4. For Review mode:
   - Select a child's profile
   - View performance statistics
   - Review past exercises

## Planned Features

- Support for division, addition, and subtraction
- Multiple difficulty levels
- Achievement system
- Multi-language support
- Visual learning aids
- Custom exercise creation for parents

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.
This means you are free to:

Share — copy and redistribute the material in any medium or format
Adapt — remix, transform, and build upon the material

Under the following terms:

Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made.
NonCommercial — You may not use the material for commercial purposes.

See the full license text for more details.

## Authors

Philippe Moore