"""initial user model

Revision ID: 1c78e26ae5d2
Revises: 
Create Date: 2021-01-29 20:56:30.601064

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1c78e26ae5d2'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    print("HRERERE")
    op.create_table('users',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('registered_on', sa.DateTime(), nullable=False),
    sa.Column('first_name', sa.String(length=65), nullable=True),
    sa.Column('last_name', sa.String(length=65), nullable=True),
    sa.Column('school', sa.String(length=127), nullable=True),
    sa.Column('grade', sa.String(length=15), nullable=True),
    sa.Column('bio', sa.String(length=511), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('users')
    # ### end Alembic commands ###
