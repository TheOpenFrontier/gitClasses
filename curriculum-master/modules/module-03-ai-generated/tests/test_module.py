import pytest
from starter_code.app import load_data, process_data, generate_report, save_report

def test_load_data():
    # Test the load_data function
    result = load_data('data/test_input.txt')
    assert isinstance(result, list)  # Expecting a list
    assert len(result) > 0  # Expecting non-empty list

def test_process_data():
    # Test the process_data function
    sample_data = ["data1", "data2", "data3"]
    result = process_data(sample_data)
    assert isinstance(result, dict)  # Expecting a dictionary
    assert 'insights' in result  # Check for key in insights

def test_generate_report():
    # Test the generate_report function
    sample_insights = {'insights': 'value'}
    report = generate_report(sample_insights)
    assert isinstance(report, str)  # Expecting a string
    assert "Summary Report" in report  # Check contents include expected phrase

def test_save_report():
    # Test for save_report function
    report_content = "This is a test report."
    output_path = 'test_output.txt'
    save_report(report_content, output_path)
    with open(output_path, 'r') as f:
        content = f.read()
        assert content == report_content  # Check if saved content matches
    
    # Cleanup
    import os
    os.remove(output_path)

if __name__ == "__main__":
    pytest.main()
```

---
