"""use string type for cognito id foreign key

Revision ID: 8659618cd84b
Revises: 6e2bea29fae6
Create Date: 2021-02-21 19:10:53.647547

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8659618cd84b'
down_revision = '6e2bea29fae6'
branch_labels = None
depends_on = None


def upgrade():

    # can't do with alembic, so just using sql:
    # https://stackoverflow.com/questions/29069506/alembic-alter-column-type-with-using
    op.drop_constraint('availability_tutor_fkey', 'availability', type_='foreignkey')
    op.execute('ALTER TABLE availability ALTER COLUMN tutor TYPE varchar(255)')
    op.create_foreign_key(None, 'availability', 'users', ['tutor'], ['cognitoId'])

    # ### commands auto generated by Alembic - please adjust! ###
    # op.drop_constraint('availability_tutor_fkey', 'availability', type_='foreignkey')
    # op.create_foreign_key(None, 'availability', 'users', ['tutor'], ['cognitoId'])
    # op.alter_column('users', 'cognitoId',
               # existing_type=sa.VARCHAR(length=255),
               # nullable=False)
    # op.alter_column('users', 'email',
               # existing_type=sa.VARCHAR(length=255),
               # nullable=False)
    # ### end Alembic commands ###


def downgrade():

    # after more thinking, I bet I could do this with alembic. I think that stackoverflow
    # article is pointed towards the USING statement, which I don't even need, yet..
    op.drop_constraint('availability_tutor_fkey', 'availability', type_='foreignkey')
    op.execute('ALTER TABLE availability ALTER COLUMN tutor TYPE INT')
    op.create_foreign_key(None, 'availability', 'users', ['tutor'], ['cognitoId'])

    # ### commands auto generated by Alembic - please adjust! ###
    # op.alter_column('users', 'email',
               # existing_type=sa.VARCHAR(length=255),
               # nullable=True)
    # op.alter_column('users', 'cognitoId',
               # existing_type=sa.VARCHAR(length=255),
               # nullable=True)
    # op.drop_constraint(None, 'availability', type_='foreignkey')
    # op.create_foreign_key('availability_tutor_fkey', 'availability', 'users', ['tutor'], ['id'])
    # ### end Alembic commands ###