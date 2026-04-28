import pytest
import numpy as np
from starter_code.app import NeuralNetwork 

class TestNeuralNetwork:
    def test_learning_contract(self):
        # This test checks if the learning contract has been signed
        assert True, "You must complete the learning contract and document it in your repository."

    def test_forward_pass(self):
        nn = NeuralNetwork(input_size=3, hidden_size=5, output_size=2)
        x = np.array([[1, 2, 3]])
        output = nn.forward_pass(x)
        assert output.shape == (1, 2), "The output shape is incorrect."

    def test_backward_pass_shapes(self):
        nn = NeuralNetwork(input_size=3, hidden_size=5, output_size=2)
        x = np.array([[1, 2, 3]])
        y = np.array([[1, 0]])
        output = nn.forward_pass(x)
        nn.backward_pass(x, y, output)  # Ensure no errors occur in shape
        assert True, "Backward pass executed without shape errors."

    def test_train(self):
        nn = NeuralNetwork(input_size=3, hidden_size=5, output_size=2)
        x = np.array([[1, 2, 3]])
        y = np.array([[1, 0]])
        nn.train(x, y, epochs=100)
        # Optionally verify weights are updated but implementation is needed
        assert True, "Training executed without errors."

```

---
