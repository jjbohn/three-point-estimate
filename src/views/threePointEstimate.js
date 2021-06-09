import React, { useState, useEffect } from "react";

const EXTENSION_ID = 'jjbohn.three-point-estimate';
const FIELD = 'estimate';

const Styles = () => {
  return (
    <style>
      {`
        .form {
          display: flex;
          justify-content: space-between;
          width: 100%;
         }

        .case {
          background-color: var(--aha-gray-200);
          border: 1px solid var(--aha-gray-400);
          border-radius: 4px;
          margin: 5px;
          padding: 5px;
          text-align: center;
        }

        .title {
          color: var(--aha-gray-600);
          font-size: 15px;
          text-align: center;
          text-transform: uppercase;
        }

        .case-input, .case-expected-value {
          display: inline;
          max-width: 90px;
          margin-top: 8px;
          border: none;
          margin: 8px auto;
          background-color: var(--aha-gray-200);
          color: var(--aha-gray-800);
          font-weight: bold;
          font-size: 20px;
          text-align: center;
        }

        .case-expected-value {
          font-size: 26px;
          widht: auto;
        }

        .case-input:focus {
          outline: none;
        }
    `}
    </style>
  );
};

const EstimateForm = ({ estimate, setEstimate }) => {

  const handleUpdate = (key) => {
    return (event) => {
      let newValue = parseInt(event.target.value);

      if (isNaN(newValue)){
        newValue = 0;
      }
      estimate[key] = newValue;
      setEstimate(estimate);
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div className='form'>
      <div className='case'>
        <span className='title'>Best</span>
        <input className='case-input' onKeyDown={handleKeyDown} onBlur={handleUpdate('best')} value={estimate['best']} />
      </div>
      <div className='case'>
        <span className='title'>Worst</span>
        <input className='case-input' onKeyDown={handleKeyDown} onBlur={handleUpdate('worst')} value={estimate['worst']} />
      </div>
      <div className='case'>
        <span className='title'>Likely</span>
        <input className='case-input' onKeyDown={handleKeyDown} onBlur={handleUpdate('likely')} value={estimate['likely']} />
      </div>
    </div>
  );
};

const ThreePointEstimate = (props) => {
  const { algorithm, record } = props;
  const [estimate, setEstimate] = useState(props.estimate);

  useEffect(() => setEstimate(props.estimate), [props.estimate, algorithm]);

  const storeEstimate = async (estimate) => {
    setEstimate(estimate);
    await record.setExtensionField(EXTENSION_ID, FIELD, estimate);
  };

  const triangular = (estimate) => {
    return (estimate.best + estimate.worst + estimate.likely) / 3;
  };

  const pert = (estimate) => {
    return (estimate.best + estimate.worst + (4 * estimate.likely)) / 6;
  };

  const expectedCase = (estimate) => {
    let value = 0;

    switch(algorithm) {
    case 'pert':
      value = pert(estimate);
      break;
    case 'triangular':
    default:
      value = triangular(estimate);
      break;
    }

    return Math.round(value);
  };

  return (
    <div>
      <Styles />
      <div className='three-point-estimate'>
        <div className="three-point-estimate__input">
          <EstimateForm estimate={estimate} setEstimate={storeEstimate} />
        </div>
        <div className="case">
          <span className='title'>Expected case</span>
          <br />
          <div className='case-expected-value'>
            {expectedCase(estimate)}
          </div>
        </div>
      </div>
    </div>
  );
};

aha.on("threePointEstimate", ({ record, fields, container }, { settings }) => {
  const estimate = fields[FIELD];
  const algorithm = settings.expectedCaseAlgorithm;

  return (
    <ThreePointEstimate record={record} estimate={estimate} algorithm={algorithm} />
  );
});
